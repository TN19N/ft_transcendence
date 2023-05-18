import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy, Intra42Strategy } from "./strategy";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
    imports: [JwtModule.register({})],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, Intra42Strategy],
})
export class AuthModule {}