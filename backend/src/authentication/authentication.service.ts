import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User, UserPreferences } from "@prisma/client";
import { DatabaseService } from "./../database/database.service";
import { authenticator } from "otplib";
import { JwtPayload } from "./interface";
import { UserService } from "./../user/user.service";
import { createDecipheriv } from "crypto";
import { ConfigService } from "@nestjs/config";
import * as fs from 'fs';
import axios from 'axios';

@Injectable()
export class AuthenticationService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly databaseService: DatabaseService,
        private readonly userService: UserService,
        private readonly configurationService: ConfigService,
    ) {}

    async getLoginCookie(user: User, isTwoFactorAuthenticationEnabled: boolean | undefined = undefined): Promise<string> {
        if (isTwoFactorAuthenticationEnabled === undefined) {
            const userPreferences: UserPreferences = await this.userService.getUserPreferences(user.preferencesId);
            isTwoFactorAuthenticationEnabled = userPreferences.isTwoFactorAuthenticationEnabled;
        }

        const payload : JwtPayload = {
            sub: user.id,
            tfa: isTwoFactorAuthenticationEnabled,
        };

        return `Authentication=${await this.jwtService.signAsync(payload)}; PAth=/`;
    }

    async signUpUser(profile: any): Promise<User> {
        const user: User | null = await this.databaseService.user.findUnique({
            where: { intraId: parseInt(profile.id) },
        });

        if (user) {
            return user;
        } else {
            const user: User = await this.databaseService.user.create({
                data: {
                    intraId: parseInt(profile.id),
                    profile: {
                        create: {
                            name: profile.username,
                        }
                    },
                    preferences: { create: {} },
                    sensitiveData: { create: {} },
                },
            });

            const response = await axios.get(profile._json.image.link, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data, 'binary');

            if (fs.existsSync('./upload') == false) {
                fs.mkdirSync('./upload');
            }

            await fs.promises.writeFile('./upload/' + user.id, buffer);

            return user;
        }
    }

    async validateTwoFactorAuthenticationCode(user: User, twoFactorAuthenticationCode: string): Promise<boolean> {
        const userSensitiveData = await this.userService.getUserSensitiveData(user.sensitiveDataId);

        let isValid : boolean = false;
        if (userSensitiveData.twoFactorAuthenticationSecret && userSensitiveData.iv) {
            const {twoFactorAuthenticationSecret, iv} = userSensitiveData;

            const ivBuffer = Buffer.from(iv, 'hex');
            const decipher = createDecipheriv('aes-256-cbc', this.configurationService.get('ENCRYPT_KEY')!, ivBuffer);

            const secret = decipher.update(twoFactorAuthenticationSecret, 'hex', 'utf-8') + decipher.final('utf-8');

            isValid = authenticator.verify({
                token: twoFactorAuthenticationCode,
                secret: secret,
            });
        }

        if (isValid) {
            await this.databaseService.userPreferences.update({
                where: { id: user.preferencesId },
                data: { isTwoFactorAuthenticationEnabled: true },
            });
        }

        return isValid;
    }
}