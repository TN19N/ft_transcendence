import { Injectable } from "@nestjs/common";
import { GameRecord, PrismaClient } from "@prisma/client";
import { DatabaseService } from "./../database/database.service";

@Injectable()
export class GameRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    // Games Record [C-R]
    public async createUserGameRecord(user1Id: string, user1Score: number, user2Id: string, user2Score: number, prisma: PrismaClient = this.databaseService): Promise<GameRecord> {
        return prisma.$transaction<GameRecord>(async (tx)=> {
            const gameRecord = await tx.gameRecord.create({
                data: {
                    user: { connect: { id: user1Id } },
                    userScore: user1Score,
                    opponent: { connect: { id: user2Id } },
                    opponentScore: user2Score,
                }
            });

            await tx.gameRecord.create({
                data: {
                    user: { connect: { id: user2Id } },
                    userScore: user2Score,
                    opponent: { connect: { id: user1Id } },
                    opponentScore: user1Score,
                }
            });

            return gameRecord;
        });
    }

    public async getUserGamesRecord(userId: string, prisma: PrismaClient = this.databaseService): Promise<GameRecord[] | null> {
        return await this.databaseService.user.findUnique({
            where: { id: userId },
            select: {
                gamesRecord: true,
            }
        }).gamesRecord();
    }
}