import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { DatabaseService } from "./../../database/database.service";
import { Request } from "express";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        configService: ConfigService,
        private databaseService: DatabaseService
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

    async validate(payload: { sub: number }) {
        return this.databaseService.user.findUnique({
            where: {
                id: payload.sub
            }
        })
    }
}