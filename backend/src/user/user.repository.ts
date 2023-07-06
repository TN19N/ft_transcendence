import { Injectable } from "@nestjs/common";
import { FriendRequest, Prisma, PrismaClient, User, UserProfile } from "@prisma/client";
import { constrainedMemory } from "process";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class UserRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    // User [C-R-U-D]
    public createUser(params: Prisma.UserCreateArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.user.create(params);
    }

    public getUser(params: Prisma.UserFindUniqueArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.user.findUnique(params);
    }

    public updateUser(params: Prisma.UserUpdateArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.user.update(params);
    }

    public deleteUser(params: Prisma.UserDeleteArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.user.delete(params);
    }

    // Users [R-U]
    public getUsers(params: Prisma.UserFindManyArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.user.findMany(params);
    }

    public updateUsers(params: Prisma.UserUpdateManyArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.user.updateMany(params);
    }

    // User Profile [R-U]
    public getUserProfile(params: Prisma.UserProfileFindUniqueArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.userProfile.findUnique(params);
    }

    public updateUserProfile(params: Prisma.UserProfileUpdateArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.userProfile.update(params);
    }

    // User Profiles [R]
    public getUsersProfiles(params: Prisma.UserProfileFindManyArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.userProfile.findMany(params);
    }

    // User Preferences [R-U]
    public getUserPreferences(params: Prisma.UserPreferencesFindUniqueArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.userPreferences.findUnique(params);
    }

    public updateUserPreferences(params: Prisma.UserPreferencesUpdateArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.userPreferences.update(params);
    }

    // User Sensitive Data [R-U]
    public getUserSensitiveData(params: Prisma.UserSensitiveDataFindUniqueArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.userSensitiveData.findUnique(params);
    }

    public updateUserSensitiveData(params: Prisma.UserSensitiveDataUpdateArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.userSensitiveData.update(params);
    }

    // Friendship [C-R-D]
    private createFriendship(params: Prisma.FriendshipCreateArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.$transaction( async (tx) => {
            const friendship = await tx.friendship.create(params);

            await tx.friendship.create({
                ...params,
                data: {
                    ...(params.data as Prisma.FriendshipCreateInput),
                    user:   { connect: { id: params.data.friendId } },
                    friend: { connect: { id: params.data.userId   } },
                },
            });

            return friendship;
        });
    }

    public getFriendship(params: Prisma.FriendshipFindUniqueArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.friendship.findUnique(params);
    }
    
    public deleteFriendship(params: Prisma.FriendshipDeleteArgs, prisma: PrismaClient = this.databaseService) {
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
    public getFriendships(params: Prisma.FriendshipFindManyArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.friendship.findMany(params);
    }
    
    // Friend Request [C-R-D]
    public createFriendRequest(params: Prisma.FriendRequestCreateArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.friendRequest.create(params);
    }
    
    public getFriendRequest(params: Prisma.FriendRequestFindUniqueArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.friendRequest.findUnique(params);
    }

    public deleteFriendRequest(params: Prisma.FriendRequestDeleteArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.friendRequest.delete(params);
    }

    // Friend Requests [R-D]
    public getFriendRequests(params: Prisma.FriendRequestFindManyArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.friendRequest.findMany(params);
    }

    public deleteFriendRequests(params: Prisma.FriendRequestDeleteManyArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.friendRequest.deleteMany(params);
    }

    // Tools
    public acceptFriendRequest(friendRequest: FriendRequest, prisma: PrismaClient = this.databaseService) {
        return prisma.$transaction( async (tx: PrismaClient) => {
            const friendship = await this.createFriendship({
                data: {
                    userId: friendRequest.senderId,
                    friendId: friendRequest.receiverId,
                },
            }, tx);

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
            }, tx);

            return friendship;
        });
    }
}