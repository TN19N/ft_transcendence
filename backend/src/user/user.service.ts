import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { User, UserPreferences, UserProfile, UserSensitiveData } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';

@Injectable()
export class UserService {
    constructor(
        private databaseService: DatabaseService,
    ) {}

    // for testing purposes delete all users
    async deleteAll() {
        await this.databaseService.user.deleteMany();
        await this.databaseService.userProfile.deleteMany();
        await this.databaseService.userPreferences.deleteMany();
        await this.databaseService.userSensitiveData.deleteMany();
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
        if (userSensitiveData.twoFactorAuthenticationSecret) {
            secret = userSensitiveData.twoFactorAuthenticationSecret;
        } else {
            secret = authenticator.generateSecret();
            await this.databaseService.userSensitiveData.update({
                where: { id: user.sensitiveDataId },
                data: { twoFactorAuthenticationSecret: secret },
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
}