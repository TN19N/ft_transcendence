import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-42";
import { AuthService } from "../auth.service";

@Injectable()
export class Intra42Strategy extends PassportStrategy(Strategy, 'intra42') {
    constructor(
        configService: ConfigService,
        private authService: AuthService,
    ) {
        super({
            clientID: configService.get('INTRA_42_CLIENT_ID'),
            clientSecret: configService.get('INTRA_42_CLIENT_SECRET'),
            callbackURL: configService.get('INTRA_42_CALLBACK_URL'),
            scope: 'public',
        });
    }

    async validate(access_token: string, refresh_token: string, profile: any) {
        return this.authService.validateUser(profile);
    }
}