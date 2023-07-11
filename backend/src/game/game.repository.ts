import { Injectable } from "@nestjs/common";
import { GameRecord } from "@prisma/client";
import { DatabaseService } from "./../database/database.service";

@Injectable()
export class GameRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    // Games Record [R]
    public async getUserGamesRecord(userId: string): Promise<GameRecord[] | null> {
        return await this.databaseService.userProfile.findUnique({
            where: { userId: userId },
            select: {
                gamesRecord: true,
            }
        }).gamesRecord();
    }
}