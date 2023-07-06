import { Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";
import * as Joi from 'joi';

@Module({
    imports: [
        NestConfigModule.forRoot({
            validationSchema: Joi.object({
                FRONTEND_ORIGIN: Joi.string().required(),
                DATABASE_URL: Joi.string().required(),
                ENCRYPT_KEY: Joi.string().required(),
                JWT_SECRET: Joi.string().required(),
                BACKEND_PORT: Joi.number().required(),
                BACKEND_HOST: Joi.string().required(),
                INTRA_42_CLIENT_ID: Joi.string().required(),
                INTRA_42_CLIENT_SECRET: Joi.string().required(),
                INTRA_42_CALLBACK_URL: Joi.string().required(),
                BOT_PROFILE_PICTURE_PATH: Joi.string().required(),
            })
        }),
    ],
    exports: [NestConfigModule],
})
export class ConfigurationModule {}