import { Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";
import * as Joi from '@hapi/joi';

@Module({
    imports: [
        NestConfigModule.forRoot({
            isGlobal: true,
            validationSchema: Joi.object({
                DATABASE_URL: Joi.string().required(),
                JWT_SECRET: Joi.string().required(),
                BACKEND_PORT: Joi.number().required(),
                INTRA_42_CLIENT_ID: Joi.string().required(),
                INTRA_42_CLIENT_SECRET: Joi.string().required(),
                INTRA_42_CALLBACK_URL: Joi.string().required(),
            })
        }),
    ],
})
export class ConfigModule {}