import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: app.get(ConfigService).get('FRONTEND_ORIGIN'),
        credentials: true,
        methods: ['GET', 'POST']
    });
    
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
    }));

    app.setGlobalPrefix('api');
    app.use(cookieParser());

    const config = new DocumentBuilder()
        .setTitle('PingPong API Documentation')
        .setDescription('The PingPong API description')
        .setVersion('1.0')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/api/docs', app, document);

    await app.listen(app.get(ConfigService).get('BACKEND_PORT')!);
}

bootstrap();