import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { DatabaseService } from "./../../database/database.service";
import { Request } from "express";
import { User } from "@prisma/client";
import { JwtPayload } from "./../interface";

@Injectable()
export class Jwt2faStrategy extends PassportStrategy(Strategy, 'jwt2fa') {
    constructor(
        readonly configService: ConfigService,
        private readonly databaseService: DatabaseService
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
            return await this.databaseService.user.findUnique({
                where: { id: payload.sub }
            });
        } else {
            return null;
        }
    }
}