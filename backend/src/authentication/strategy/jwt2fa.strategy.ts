import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { User } from "@prisma/client";
import { JwtPayload } from "./../interface";
import { UserService } from "src/user/user.service";

@Injectable()
export class Jwt2faStrategy extends PassportStrategy(Strategy, 'jwt2fa') {
    constructor(
        readonly configService: ConfigService,
        private readonly userService: UserService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => {
                    return request?.cookies?.Authentication;
                }
            ]),
            secretOrKey: configService.get('JWT_SECRET'),
        });
    }

    async validate(payload: JwtPayload) : Promise<User | null> {
        if (payload.tfa == true) {
            return await this.userService.getUser(payload.sub);
        } else {
            return null;
        }
    }
}