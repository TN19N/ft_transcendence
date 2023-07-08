import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { FriendRequest, Friendship, Prisma, User, UserPreferences, UserProfile, UserSensitiveData } from '@prisma/client';
import { DatabaseService } from './../database/database.service';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { UserProfileDto } from './dto';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly configurationService: ConfigService,
    ) {}

    // for testing
    public async addRandomUser(): Promise<User> {
        const user = await this.userRepository.createUser({
            data: {
                intraId: Math.floor(Math.random() * 1000000),
                profile: {
                    create: {
                        name: `bot${Math.floor(Math.random() * 1000000)}`,
                    }
                },
                preferences: { create: {} },
                sensitiveData: { create: {} },
            }
        });

        const botAvatar = "./assets/bot.png";

        const read = fs.createReadStream(botAvatar);
        const write = fs.createWriteStream(`./upload/${user.id}`);

        read.pipe(write);

        return user;
    }

    public async getUser(userId: string): Promise<User | null> {
        return await this.userRepository.getUser({
            where: {id: userId}
        });
    }

    public async getUserPreferences(userId: string): Promise<UserPreferences | null> {
        return await this.userRepository.getUserPreferences({
            where: {userId: userId},
        });
    }

    public async search(query: string): Promise<User[]> {
        return await this.userRepository.getUsers({
            where: {
                profile: {
                    name: {
                        startsWith: query,
                    },
                },
            },
        });
    }

    public async getFriendRequestsReceived(userId: string): Promise<FriendRequest[]> {
        return await this.userRepository.getFriendRequests({
            where: { receiverId: userId }
        });
    }

    public async getFriendRequestsSent(userId: string): Promise<FriendRequest[]> {
        return await this.userRepository.getFriendRequests({
            where: { senderId: userId }
        });
    }

    public async acceptFriendRequest(userId: string, friendId: string): Promise<Friendship | null> {
        const friendRequest = await this.userRepository.getFriendRequest({
            where:   {
                FriendRequestUniqueConstraint: {
                    senderId: friendId,
                    receiverId: userId,
                },
            },
        });

        if (friendRequest) {
            return await this.userRepository.acceptFriendRequest(friendRequest);
        }

        return null;
    }

    public async turnOnTwoFactorAuthentication(userId: string): Promise<string> {
        const userSensitiveData = await this.userRepository.getUserSensitiveData({
            where: { userId: userId },
        });

        if (!userSensitiveData) {
            throw new NotFoundException('User Sensitive Data not found');
        }

        const userProfile = await this.userRepository.getUserProfile({
            where: { userId: userId },
        });

        if (!userProfile) {
            throw new NotFoundException('User Profile not found');
        }

        let secret: string;
        if (userSensitiveData.twoFactorAuthenticationSecret && userSensitiveData.iv) {
            let {twoFactorAuthenticationSecret, iv} = userSensitiveData;

            const ivBuffer = Buffer.from(iv, 'hex');
            const decipher = createDecipheriv('aes-256-cbc', this.configurationService.get('ENCRYPT_KEY')!, ivBuffer);

            secret = decipher.update(twoFactorAuthenticationSecret, 'hex', 'utf-8') + decipher.final('utf-8');
        } else {
            secret = authenticator.generateSecret();

            const iv = randomBytes(16);
            const cipher = createCipheriv('aes-256-cbc', this.configurationService.get('ENCRYPT_KEY')!, iv);

            await this.userRepository.updateUserSensitiveData({
                where: { userId: userId },
                data: {
                    twoFactorAuthenticationSecret: cipher.update(secret, 'utf-8', 'hex') + cipher.final('hex'),
                    iv: iv.toString('hex'),
                }
            });
        }

        return await QRCode.toDataURL(authenticator.keyuri(userProfile.name, 'PingPong', secret));
    }

    public async turnOffTwoFactorAuthentication(userId: string): Promise<void> {
        const userPreferences = await this.userRepository.getUserPreferences({
            where: { userId: userId },
        });

        if (!userPreferences) {
            throw new NotFoundException('user preferences not found');
        }

        if (userPreferences.isTwoFactorAuthenticationEnabled === true) {
            await this.userRepository.updateUser({
                where: { id: userId },
                data: {
                    preferences: {
                        update: {
                            isTwoFactorAuthenticationEnabled: false,
                        }
                    },
                    sensitiveData: {
                        update: {
                            twoFactorAuthenticationSecret: null,
                            iv: null,
                        }
                    }
                }
            });
        }
    }

    public async enableTwoFactorAuthentication(userId: string) : Promise<void> {
        await this.userRepository.updateUserPreferences({
            where: { userId: userId },
            data:  { isTwoFactorAuthenticationEnabled: true },
        });
    }

    private async isFriend(userId: string, friendId: string) : Promise<boolean> {
        const friendship = await this.userRepository.getFriendship({
            where: {
                FriendshipUniqueConstraint: {
                    userId: userId,
                    friendId: friendId,
                },
            },
        });

        return friendship ? true : false;
    }

    public async sendFriendRequest(userId: string, friendId: string) : Promise<void> {
        if (userId === friendId) {
            throw new ConflictException('user cannot send a friend request to himself');
        }

        if (await this.userRepository.getUser({ where: { id: friendId } }) === null) {
            throw new NotFoundException('friend not found');
        }

        if (await this.isFriend(userId, friendId)) {
            throw new ConflictException('user is already a friend');
        }

        try {
            await this.userRepository.createFriendRequest({
                data: {
                    senderProfile: { connect: { userId: userId } },
                    receiverProfile: { connect: { userId: friendId } },
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ConflictException('Friend request already exists');
                }
            }

            throw error;
        }
    }

    public async getUserFriends(userId: string): Promise<User[] | null> {
        return await this.userRepository.getUser({
            where:  { id: userId},
            select: { friends: true },
        }).friends() as User[] | null;
    }

    public async getUserProfile(userId: string): Promise<UserProfile | null> {
        return await this.userRepository.getUserProfile({
            where: {userId: userId},
        });
    }

    public async updateUserProfile(userId: string, userProfileDto: UserProfileDto): Promise<void> {
        try {
            await this.userRepository.updateUserProfile({
                where: {userId},
                data: {...userProfileDto},
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ConflictException('User name already exists');
                }
            }

            throw error;
        }
    }

    async getUserSensitiveData(userId: string) : Promise<UserSensitiveData | null> {
        return await this.userRepository.getUserSensitiveData({
            where: {userId: userId},
        });
    }
}