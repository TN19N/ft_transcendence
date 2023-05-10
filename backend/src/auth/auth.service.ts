import { Body, ForbiddenException, Injectable } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { AuthDto } from "./dto";
import * as bcrypt from 'bcrypt';
import { Prisma } from "@prisma/client";

@Injectable()
export class AuthService {
    constructor(private databaseService: DatabaseService) {}

    async signup(dto: AuthDto) {
        const hash = await bcrypt.hash(dto.password, 12);

        try {
            const user = await this.databaseService.user.create({
                data: {
                    username: dto.username,
                    password: hash,
                },
                select: {
                    id: true,
                    username: true,
                }
            });

            return user;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException('Credentials are already in use.');
                }
            }
            throw error;
        }
    }

    async signin(dto: AuthDto) {

        const user = await this.databaseService.user.findUnique({
            where: {
                username: dto.username,
            },
        })

        if (!user) {
            throw new ForbiddenException('Credentials are invalid.');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.password);

        if (!isPasswordValid) {
            throw new ForbiddenException('Credentials are invalid.');
        }

        return user;
    }
}