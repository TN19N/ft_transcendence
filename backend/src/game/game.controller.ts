import { Controller, Get, HttpCode, HttpStatus, NotFoundException, Query, UseGuards } from '@nestjs/common';
import { JwtGuard } from './../authentication/guard';
import { GameService } from './game.service';
import { ApiNotFoundResponse, ApiOkResponse, ApiQuery, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { GetUserId } from './../authentication/decorator';
import { GameRecord } from '@prisma/client';

@ApiTags('game')
@Controller('game')
@UseGuards(JwtGuard)
@ApiUnauthorizedResponse({description: "unauthorize"})
export class GameController {
    constructor(private readonly gameService: GameService) {}

    @Get('record')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({description: "games record returned! GameRecord[]"})
    @ApiNotFoundResponse({description: "Games record for the user not found!"})
    @ApiQuery({name: "id", required: false})
    async getGamesRecord(@GetUserId() userId: string, @Query('id') id?: string) {
        const gamesRecord: GameRecord[] | null = await this.gameService.getGamesRecord(id ?? userId);

        if (gamesRecord) {
            return gamesRecord;
        } else {
            throw new NotFoundException(`Games record for user with id '${id ?? userId}' Not found!`)
        }
    }
}