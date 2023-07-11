import { Injectable } from '@nestjs/common';
import { GameRecord } from '@prisma/client';
import { GameRepository } from './game.repository';

@Injectable()
export class GameService {
    constructor(private readonly gameRepository: GameRepository) {}

    public async getGamesRecord(id: string): Promise<GameRecord[] | null> {
        return await this.gameRepository.getUserGamesRecord(id);
    }
}