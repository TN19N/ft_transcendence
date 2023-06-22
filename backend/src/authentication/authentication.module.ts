import { Module, forwardRef } from "@nestjs/common";
import { AuthenticationController } from "./authentication.controller";
import { AuthenticationService } from "./authentication.service";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy, Jwt2faStrategy, Intra42Strategy } from "./strategy";
import { ConfigurationModule } from "../configuration/configuration.module";
import { ConfigService } from "@nestjs/config";
import { UserModule } from "./../user/user.module";

@Module({
    imports: [
        ConfigurationModule,
        forwardRef(() => UserModule),
        JwtModule.registerAsync({
            imports: [ConfigurationModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET'),
                signOptions: {
                    expiresIn: '1d',
                }
            }),
        })
    ],
    controllers: [AuthenticationController],
    providers: [AuthenticationService, JwtStrategy, Jwt2faStrategy, Intra42Strategy],
    exports: [AuthenticationService],
})
export class AuthenticationModule {}