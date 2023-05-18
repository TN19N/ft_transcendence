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

    async login(user: User) {
        return {
            access_token: this.jwtService.sign(
                { sub: user.id },
                { secret: this.configService.get('JWT_SECRET'), },
            )
        };
    }
}