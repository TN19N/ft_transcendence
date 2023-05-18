import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}

    async getLoginCookie(user: User) {
        return `Authentication=${this.jwtService.sign({ sub: user.id })}; HttpOnly; Path=/')}`
    }
}