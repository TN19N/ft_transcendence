import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: "http://localhost:5173",
        credentials: true,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    });

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
    }));

    app.setGlobalPrefix('api');
    app.use(cookieParser());

    await app.listen(app.get(ConfigService).get('BACKEND_PORT')!);
}

bootstrap();