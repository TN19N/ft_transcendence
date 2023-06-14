import { Controller, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';

@Controller('chat')
@UseGuards(JwtGuard)
export class ChatController {
    constructor() {}
}