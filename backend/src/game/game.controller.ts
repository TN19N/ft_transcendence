import { Controller, UseGuards } from '@nestjs/common';
import { JwtGuard } from './../authentication/guard';
import { GameService } from './game.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('game')
@Controller('game')
@UseGuards(JwtGuard)
export class GameController {
    constructor(private readonly gameService: GameService) {}
}