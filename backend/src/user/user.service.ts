import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';

@Injectable()
export class UserService {

    constructor(
        private databaseService: DatabaseService,
    ) {}

    async switch2fa(user: User) {
        if (user.isTwoFactorAuthenticationEnabled == true) {
            await this.databaseService.user.update({
                where: { id: user.id },
                data: {
                    isTwoFactorAuthenticationEnabled: false,
                    twoFactorAuthenticationSecret: null
                }
            })
        } else {
            let secret : string;

            if (user.twoFactorAuthenticationSecret == null) {
                secret = authenticator.generateSecret();

                await this.databaseService.user.update({
                    where: { id: user.id },
                    data: {
                        twoFactorAuthenticationSecret: secret
                    }
                });
            } else {
                secret = user.twoFactorAuthenticationSecret;
            }

            const otpauth = authenticator.keyuri(user.username, 'PingPong', secret);
            return await QRCode.toDataURL(otpauth);
        }
    }

     
    async enable2fa(user: User, twoFaCode: string): Promise<boolean> {
        const isValid : boolean = authenticator.verify({
            token: twoFaCode,
            secret: user.twoFactorAuthenticationSecret!
        });

        if (isValid) {
            await this.databaseService.user.update({
                where: { id: user.id },
                data: {
                    isTwoFactorAuthenticationEnabled: true
                }
            });
        }

        return isValid;
    }
}