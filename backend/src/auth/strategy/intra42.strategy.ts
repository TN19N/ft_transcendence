import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-42";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class Intra42Strategy extends PassportStrategy(Strategy, 'intra42') {
    constructor(
        private configService: ConfigService,
        private databaseService: DatabaseService
    ) {
        super({
            clientID: configService.get('INTRA_42_CLIENT_ID'),
            clientSecret: configService.get('INTRA_42_CLIENT_SECRET'),
            callbackURL: configService.get('INTRA_42_CALLBACK_URL'),
            scope: 'public',
        });
    }

    async validate(access_token: string, refresh_token: string, profile: any) {
        const user = await this.databaseService.user.findUnique({
            where: {
                id: parseInt(profile.id),
            }
        });

        if (user) {
            return user;
        } else {
            return await this.databaseService.user.create({
                data: {
                    id: parseInt(profile.id),
                    username: profile.username,
                },
            });
        }
    }
}