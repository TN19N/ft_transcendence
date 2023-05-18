import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import { DatabaseService } from "src/database/database.service";
import * as fs from 'fs';
import axios from 'axios';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        private databaseService: DatabaseService,
    ) {}

    async getLoginCookie(user: User) {
        return `Authentication=${this.jwtService.sign({ sub: user.id })}; HttpOnly; Path=/')}`
    async validateUser(profile: any) {
        const user = await this.databaseService.user.findUnique({
            where: {
                id: parseInt(profile.id),
            }
        });

        if (user) {
            return user;
        } else {
            const write = fs.createWriteStream('./upload/' + profile.id + '.jpg');

            const response = await axios.get(profile._json.image.link, { responseType: 'stream' });

            response.data.pipe(write);

            return await this.databaseService.user.create({
                data: {
                    id: parseInt(profile.id),
                    username: profile.username,
                },
            });
        }
    }

    async login(user: User) {
        return {
            access_token: this.jwtService.sign(
                { sub: user.id },
                { secret: this.configService.get('JWT_SECRET'), },
            )
        };
    }
}