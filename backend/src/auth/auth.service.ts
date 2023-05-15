import { Injectable } from "@nestjs/common";
import { DatabaseService } from "./../database/database.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
    constructor(
        private databaseService: DatabaseService,
        private jwtService: JwtService,
        private configService: ConfigService
        ) {}
}