import { Controller, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';

@Controller('game')
@UseGuards(JwtGuard)
export class GameController {
    constructor() {}
}