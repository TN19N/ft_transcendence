import { Injectable } from "@nestjs/common";
import { Ban, FriendRequest, Friendship, Prisma, PrismaClient, User, UserPreferences, UserProfile, UserSensitiveData } from "@prisma/client";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class UserRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    // User [C-R-U-D]
    public createUser(params: Prisma.UserCreateArgs, prisma: PrismaClient = this.databaseService): Promise<User> {
        return prisma.user.create(params);
    }

    public getUser(params: Prisma.UserFindUniqueArgs, prisma: PrismaClient = this.databaseService): Promise<User | null> {
        return prisma.user.findUnique(params);
    }

    public updateUser(params: Prisma.UserUpdateArgs, prisma: PrismaClient = this.databaseService): Promise<User> {
        return prisma.user.update(params);
    }

    public deleteUser(params: Prisma.UserDeleteArgs, prisma: PrismaClient = this.databaseService): Promise<User> {
        return prisma.user.delete(params);
    }

    // Users [R-U]
    public getUsers(params: Prisma.UserFindManyArgs, prisma: PrismaClient = this.databaseService): Promise<User[]> {
        return prisma.user.findMany(params);
    }

    public updateUsers(params: Prisma.UserUpdateManyArgs, prisma: PrismaClient = this.databaseService): Promise<Prisma.BatchPayload> {
        return prisma.user.updateMany(params);
    }

    // User Profile [R-U]
    public getUserProfile(params: Prisma.UserProfileFindUniqueArgs, prisma: PrismaClient = this.databaseService): Promise<UserProfile | null> {
        return prisma.userProfile.findUnique(params);
    }

    public updateUserProfile(params: Prisma.UserProfileUpdateArgs, prisma: PrismaClient = this.databaseService): Promise<UserProfile> {
        return prisma.userProfile.update(params);
    }

    // User Profiles [R]
    public getUsersProfiles(params: Prisma.UserProfileFindManyArgs, prisma: PrismaClient = this.databaseService): Promise<UserProfile[]> {
        return prisma.userProfile.findMany(params);
    }

    // User Preferences [R-U]
    public getUserPreferences(params: Prisma.UserPreferencesFindUniqueArgs, prisma: PrismaClient = this.databaseService): Promise<UserPreferences | null> {
        return prisma.userPreferences.findUnique(params);
    }

    public updateUserPreferences(params: Prisma.UserPreferencesUpdateArgs, prisma: PrismaClient = this.databaseService): Promise<UserPreferences> {
        return prisma.userPreferences.update(params);
    }

    // User Sensitive Data [R-U]
    public getUserSensitiveData(params: Prisma.UserSensitiveDataFindUniqueArgs, prisma: PrismaClient = this.databaseService): Promise<UserSensitiveData | null> {
        return prisma.userSensitiveData.findUnique(params);
    }

    public updateUserSensitiveData(params: Prisma.UserSensitiveDataUpdateArgs, prisma: PrismaClient = this.databaseService): Promise<UserSensitiveData> {
        return prisma.userSensitiveData.update(params);
    }

    // Friendship [C-R-D]
    private async createFriendship(params: Prisma.FriendshipCreateArgs, prisma: PrismaClient = this.databaseService): Promise<Friendship> {
        const friendship = await prisma.friendship.create(params);

        await prisma.friendship.create({
            ...params,
            data: {
                user:   { connect: { id: params.data.friendId } },
                friend: { connect: { id: params.data.userId   } },
            },
        });

        return friendship;
    }

    public getFriendship(params: Prisma.FriendshipFindUniqueArgs, prisma: PrismaClient = this.databaseService): Promise<Friendship | null> {
        return prisma.friendship.findUnique(params);
    }
    
    public deleteFriendship(params: Prisma.FriendshipDeleteArgs, prisma: PrismaClient = this.databaseService): Promise<Friendship> {
        return prisma.$transaction( async (tx) => {
            const friendship = await tx.friendship.delete(params);
            
            await tx.friendship.delete({
                ...params,
                where: {
                    ...params.where,
                    FriendshipUniqueConstraint: {
                        userId: params.where.FriendshipUniqueConstraint!.friendId,
                        friendId: params.where.FriendshipUniqueConstraint!.userId,
                    }
                },
            });
            
            return friendship;
        });
    }

    // Friendships [R]
    public getFriendships(params: Prisma.FriendshipFindManyArgs, prisma: PrismaClient = this.databaseService): Promise<Friendship[]>  {
        return prisma.friendship.findMany(params);
    }
    
    // Friend Request [C-R-D]
    public createFriendRequest(params: Prisma.FriendRequestCreateArgs, prisma: PrismaClient = this.databaseService): Promise<FriendRequest> {
        return prisma.friendRequest.create(params);
    }
    
    public getFriendRequest(params: Prisma.FriendRequestFindUniqueArgs, prisma: PrismaClient = this.databaseService): Promise<FriendRequest | null> {
        return prisma.friendRequest.findUnique(params);
    }

    public deleteFriendRequest(params: Prisma.FriendRequestDeleteArgs, prisma: PrismaClient = this.databaseService): Promise<FriendRequest> {
        return prisma.friendRequest.delete(params);
    }

    // Friend Requests [R-D]
    public getFriendRequests(params: Prisma.FriendRequestFindManyArgs, prisma: PrismaClient = this.databaseService): Promise<FriendRequest[]> {
        return prisma.friendRequest.findMany(params);
    }

    public deleteFriendRequests(params: Prisma.FriendRequestDeleteManyArgs, prisma: PrismaClient = this.databaseService): Promise<Prisma.BatchPayload> {
        return prisma.friendRequest.deleteMany(params);
    }

    // Friends [R]
    public async getUserFriends(userId: string): Promise<User[] | null> {
        return await this.databaseService.user.findUnique({
            where: { id: userId },
            select: {
                friends: true,
            },
        }).friends() as User[] | null;
    }

    // Ban [C-R-D]
    public async createBan(params: Prisma.BanCreateArgs, prisma: PrismaClient = this.databaseService): Promise<Ban> {
        return await prisma.ban.create(params);
    }

    public async deleteBan(params: Prisma.BanDeleteArgs, prisma: PrismaClient = this.databaseService): Promise<Ban> {
        return await prisma.ban.delete(params);
    }

    public async getBan(params: Prisma.BanFindUniqueArgs, prisma: PrismaClient = this.databaseService): Promise<Ban | null> {
        return await prisma.ban.findUnique(params);
    }

    // Ban Users [R]
    public async getBannedUsers(userId: string): Promise<User[] | null> {
        return await this.databaseService.user.findUnique({
            where: { id: userId },
            select: {
                bannedUsers: true,
            },
        }).bannedUsers() as User[] | null;
    }

    // Accept Friend Request
    public async acceptFriendRequest(friendRequest: FriendRequest, prisma: PrismaClient = this.databaseService): Promise<Friendship> {
        return await prisma.$transaction<Friendship> ( async (tx) => {
            const friendship = await this.createFriendship({
                data: {
                    userId: friendRequest.senderId,
                    friendId: friendRequest.receiverId,
                },
            }, tx as PrismaClient);

            await this.deleteFriendRequests({
                where: {
                    OR: [
                        {
                            senderId: friendRequest.senderId,
                            receiverId: friendRequest.receiverId,
                        },
                        {
                            senderId: friendRequest.receiverId,
                            receiverId: friendRequest.senderId,
                        },
                    ],
                }
            }, tx as PrismaClient);

            return friendship;
        });
    }
}