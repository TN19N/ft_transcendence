import { Controller, UseGuards } from '@nestjs/common';
import { JwtGuard } from './../authentication/guard';
import { ChatService } from './chat.service';

@Controller('chat')
@UseGuards(JwtGuard)
export class ChatController {
    constructor(private readonly chatService: ChatService) {}
}