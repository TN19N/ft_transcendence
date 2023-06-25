import { Injectable } from "@nestjs/common";
import { FriendRequest, Prisma, PrismaClient, User, UserProfile } from "@prisma/client";
import { constrainedMemory } from "process";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class UserRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    // User C-R-U-D
    createUser(params: Prisma.UserCreateArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.user.create(params);
    }

    getUser(params: Prisma.UserFindUniqueArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.user.findUnique(params);
    }

    getUsers(params: Prisma.UserFindManyArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.user.findMany(params);
    }

    updateUser(params: Prisma.UserUpdateArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.user.update(params);
    }

    updateUsers(params: Prisma.UserUpdateManyArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.user.updateMany(params);
    }

    deleteUser(params: Prisma.UserDeleteArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.user.delete(params);
    }

    // User Profile R-U
    getUserProfile(params: Prisma.UserProfileFindUniqueArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.userProfile.findUnique(params);
    }

    getUsersProfiles(params: Prisma.UserProfileFindManyArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.userProfile.findMany(params);
    }

    updateUserProfile(params: Prisma.UserProfileUpdateArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.userProfile.update(params);
    }

    // User Preferences R-U
    getUserPreferences(params: Prisma.UserPreferencesFindUniqueArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.userPreferences.findUnique(params);
    }

    updateUserPreferences(params: Prisma.UserPreferencesUpdateArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.userPreferences.update(params);
    }

    // User Sensitive Data R-U
    getUserSensitiveData(params: Prisma.UserSensitiveDataFindUniqueArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.userSensitiveData.findUnique(params);
    }

    updateUserSensitiveData(params: Prisma.UserSensitiveDataUpdateArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.userSensitiveData.update(params);
    }

    // Friendship C-R-D
    createFriendship(params: Prisma.FriendshipCreateArgs, prisma: PrismaClient = this.databaseService) {
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

    getFriendship(params: Prisma.FriendshipFindUniqueArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.friendship.findUnique(params);
    }

    getFriendships(params: Prisma.FriendshipFindManyArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.friendship.findMany(params);
    }

    deleteFriendship(params: Prisma.FriendshipDeleteArgs, prisma: PrismaClient = this.databaseService) {
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

    // Friend Request C-R-D
    createFriendRequest(params: Prisma.FriendRequestCreateArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.friendRequest.create(params);
    }

    getFriendRequest(params: Prisma.FriendRequestFindUniqueArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.friendRequest.findUnique(params);
    }

    getFriendRequests(params: Prisma.FriendRequestFindManyArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.friendRequest.findMany(params);
    }

    deleteFriendRequest(params: Prisma.FriendRequestDeleteArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.friendRequest.delete(params);
    }

    deleteFriendRequests(params: Prisma.FriendRequestDeleteManyArgs, prisma: PrismaClient = this.databaseService) {
        return prisma.friendRequest.deleteMany(params);
    }

    // Tools
    acceptFriendRequest(friendRequest: FriendRequest, prisma: PrismaClient = this.databaseService) {
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