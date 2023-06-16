import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { FriendRequest, Prisma, User, UserPreferences, UserProfile, UserSensitiveData } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { UserProfileDto } from './dto';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

@Injectable()
export class UserService {
    constructor(
        private databaseService: DatabaseService,
        private configService: ConfigService,
    ) {}

    // for testing purposes delete all users
    async deleteAll() {
        await this.databaseService.friendRequest.deleteMany();
        await this.databaseService.user.deleteMany();
        await this.databaseService.userProfile.deleteMany();
        await this.databaseService.userPreferences.deleteMany();
        await this.databaseService.userSensitiveData.deleteMany();

        // delete upload folder if it exists
        fs.rmdirSync('./upload', { recursive: true });
    }

    // for testing purposes add random user
    async addRandomUser() {
        await this.databaseService.user.create({
            data: {
                intraId: Math.floor(Math.random() * 1000000),
                profile: {
                    create: {
                        name: `test${Math.floor(Math.random() * 1000000)}`,
                    }
                },
                preferences: { create: {} },
                sensitiveData: { create: {} },
            }
        });
    }

    async getFriendRequests(user: User) : Promise<FriendRequest[]> {
        const friendRequests: FriendRequest[] | null = await this.databaseService.user.findUnique({
            where: { id: user.id },
        }).friendRequestsReceived();

        if (friendRequests) {
            return friendRequests;
        } else {
            throw new NotFoundException('Friend requests not found');
        }
    }

    async getUserById(userId: string, TheOwner: boolean) : Promise<User> {
        const user : User | null = await this.databaseService.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                profileId: true,
                preferencesId: TheOwner,
            }
        }) as User | null;

        if (user) {
            return user;
        } else {
            throw new NotFoundException('User not found');
        }
    }

    async getUserProfile(profileId: string) : Promise<UserProfile> {
        const userProfile : UserProfile | null = await this.databaseService.userProfile.findUnique({
            where: { id: profileId },
        });

        if (userProfile) {
            return userProfile;
        } else {
            throw new NotFoundException('User profile not found');
        }
    }

    async postUserProfile(user: User, userProfileDto: UserProfileDto): Promise<void> {
        try {
            await this.databaseService.userProfile.update({
                where: { id: user.profileId },
                data: {
                    name: userProfileDto.name,
                }
            })
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ConflictException('User name already exists');
                }
            }

            throw new InternalServerErrorException('failed to update the user data.');
        }
    }

    async getUserPreferences(preferencesId: string) : Promise<UserPreferences> {
        const UserPreferences : UserPreferences | null = await this.databaseService.userPreferences.findUnique({
            where: { id: preferencesId },
        });

        if (UserPreferences) {
            return UserPreferences;
        } else {
            throw new NotFoundException('User preferences not found');
        }
    }

    async getUserSensitiveData(sensitiveDataId: string) : Promise<UserSensitiveData> {
        const userSensitiveData : UserSensitiveData | null = await this.databaseService.userSensitiveData.findUnique({
            where: { id: sensitiveDataId },
        });

        if (userSensitiveData) {
            return userSensitiveData;
        } else {
            throw new NotFoundException('User sensitive data not found');
        }
    }

    async turnOnTwoFactorAuthentication(user: User): Promise<string> {
        const userSensitiveData: UserSensitiveData = await this.getUserSensitiveData(user.sensitiveDataId);
        const userProfile: UserProfile = await this.getUserProfile(user.profileId);

        let secret: string;
        if (userSensitiveData.twoFactorAuthenticationSecret && userSensitiveData.iv) {
            let {twoFactorAuthenticationSecret, iv} = userSensitiveData;

            const ivBuffer = Buffer.from(iv, 'hex');
            const decipher = createDecipheriv('aes-256-cbc', this.configService.get('ENCRYPT_KEY')!, ivBuffer);

            secret = decipher.update(twoFactorAuthenticationSecret, 'hex', 'utf-8') + decipher.final('utf-8');
        } else {
            secret = authenticator.generateSecret();

            const iv = randomBytes(16);
            const cipher = createCipheriv('aes-256-cbc', this.configService.get('ENCRYPT_KEY')!, iv);

            await this.databaseService.userSensitiveData.update({
                where: { id: user.sensitiveDataId },
                data: { 
                    twoFactorAuthenticationSecret: cipher.update(secret, 'utf-8', 'hex') + cipher.final('hex'),
                    iv: iv.toString('hex'),
                },
            });
        }

        return await QRCode.toDataURL(authenticator.keyuri(userProfile.name, 'PingPong', secret));
    }

    async turnOffTwoFactorAuthentication(user: User): Promise<void> {
        const userPreferences: UserPreferences = await this.getUserPreferences(user.preferencesId);

        if (userPreferences.isTwoFactorAuthenticationEnabled === true) {
            await this.databaseService.user.update({
                where: { id: user.id },
                data: {
                    preferences: {
                        update: { isTwoFactorAuthenticationEnabled: false },
                    },
                    sensitiveData: {
                        update: { twoFactorAuthenticationSecret: null },
                    },
                },
            });
        }
    }

    async enableTwoFactorAuthentication(user: User) : Promise<void> {
        await this.databaseService.userPreferences.update({
            where: { id: user.preferencesId },
            data: { isTwoFactorAuthenticationEnabled: true },
        });
    }

    async checkIfIsAFriend(user: User, friendId: string) : Promise<boolean> {
        const friend: User | null = await this.databaseService.user.findUnique({
            where: { id: user.id },
        }).friends({
            where: { id: friendId },
        }) as User | null;

        return friend ? true : false;
    }

    async checkIfSentFriendRequest(user: User, friendId: string) : Promise<boolean> {
        const friendRequest: FriendRequest | null = await this.databaseService.user.findUnique({
            where: { id: user.id },
        }).friendRequestsReceived({
            where: { senderId: friendId },
        }) as FriendRequest | null;

        return friendRequest ? true : false;
    }

    async postFriend(user: User, friendId: string) : Promise<void> {
        if (user.id === friendId) {
            throw new BadRequestException('You cannot add yourself as a friend');
        }
        
        const friend: User | null = await this.databaseService.user.findUnique({
            where: { id: friendId },
        });

        // if (await this.checkIfIsAFriend(user, friendId)) {
        //     throw new ConflictException('User is already a friend');
        // }

        // if (await this.checkIfSentFriendRequest(user, friendId)) {
        //     throw new ConflictException('The Friend already sent you a friend request');
        // }

        if (friend) {
            try {
                await this.databaseService.friendRequest.create({
                    data: {
                        senderId: user.id,
                        receiverId: friendId,
                    }
                });
            } catch (error) {
                if (error instanceof Prisma.PrismaClientKnownRequestError) {
                    if (error.code === 'P2002') {
                        throw new ConflictException('Friend request already exists');
                    }
                }

                throw new InternalServerErrorException('failed to create the friend request.');
            }
        } else {
            throw new NotFoundException('Friend not found');
        }
    }

    async getFriends(user: User) : Promise<User[]> {
        const friends: User[] | null = await this.databaseService.user.findUnique({
            where: { id: user.id },
            select: { 
                friends: true,
            },
        }).friends({
            select: {
                id: true,
                profileId: true,
            }
        }) as User[] | null;

        if (friends) {
            return friends;
        } else {
            throw new NotFoundException('Friends not found');
        }
    }

    async getFriendOf(user: User) {
        const friendOf: User[] | null = await this.databaseService.user.findUnique({
            where: {  id: user.id },
            select: { friendOf: true },
        }).friendOf({
            select: {
                id: true,
                profileId: true,
            }
        }) as User[] | null;

        if (friendOf) {
            return friendOf;
        } else {
            throw new NotFoundException('Friend of not found');
        }
    }
}