import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService extends PrismaClient {
    constructor() {
        super({
            datasources: {
                db: {
                    url: 'postgresql://transcendence:Cx7wyNdVxRrcX2@localhost:5432/transcendence_db?schema=public',
                },
            },
        });
    }
}