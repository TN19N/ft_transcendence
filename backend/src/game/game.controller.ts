import { Controller, UseGuards } from '@nestjs/common';
import { JwtGuard } from './../authentication/guard';
import { GameService } from './game.service';

@Controller('game')
@UseGuards(JwtGuard)
export class GameController {
    constructor(private readonly gameService: GameService) {}
}