import { Injectable, UsePipes, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-42";
import { AuthenticationService } from "./../authentication.service";
import { User } from "@prisma/client";

@Injectable()
export class Intra42Strategy extends PassportStrategy(Strategy, 'intra42') {
    constructor(
        readonly configService: ConfigService,
        private  readonly authService: AuthenticationService,
    ) {
        super({
            clientID: configService.get('INTRA_42_CLIENT_ID'),
            clientSecret: configService.get('INTRA_42_CLIENT_SECRET'),
            callbackURL: configService.get('INTRA_42_CALLBACK_URL'),
            scope: 'public',
        });
    }

    @UsePipes(new ValidationPipe())
    async validate(_unused1: string, _unused2: string, profile: any): Promise<User> {
        return this.authService.signUpUser(profile);
    }
}