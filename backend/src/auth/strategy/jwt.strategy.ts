import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { DatabaseService } from "./../../database/database.service";
import { Request } from "express";
import { User } from "@prisma/client";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        configService: ConfigService,
        private databaseService: DatabaseService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request): string | null => {
                    return request?.cookies?.Authentication;
                }
            ]),
            secretOrKey: configService.get('JWT_SECRET'),
        });
    }

    async validate(payload: { sub: string, tfa: boolean }): Promise<User | null> {
        if (payload.tfa == false) {
            return await this.databaseService.user.findUnique({
                where: { id: payload.sub }
            });
        } else {
            return null;
        }
    }
}