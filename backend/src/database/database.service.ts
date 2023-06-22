import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService extends PrismaClient {
    constructor(readonly configService: ConfigService) {
        super({
            datasources: {
                db: { url: configService.get('DATABASE_URL') },
            },
        });
    }
}