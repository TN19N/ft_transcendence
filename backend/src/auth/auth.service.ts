import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User, UserPreferences } from "@prisma/client";
import { DatabaseService } from "src/database/database.service";
import * as fs from 'fs';
import axios from 'axios';
import { authenticator } from "otplib";
import { JwtPayloadDto } from "./dto";
import { UserService } from "src/user/user.service";
import { createDecipheriv } from "crypto";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private databaseService: DatabaseService,
        private userService: UserService,
        private configService: ConfigService,
    ) {}

    async getLoginCookie(user: User, isTwoFactorAuthenticationEnabled: boolean | undefined = undefined): Promise<string> {
        if (isTwoFactorAuthenticationEnabled === undefined) {
            const userPreferences: UserPreferences = await this.userService.getUserPreferences(user.preferencesId);
            isTwoFactorAuthenticationEnabled = userPreferences.isTwoFactorAuthenticationEnabled;
        }

        const payload : JwtPayloadDto = {
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

            // create upload folder if it doesn't exist
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
            const decipher = createDecipheriv('aes-256-cbc', this.configService.get('ENCRYPT_KEY')!, ivBuffer);

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