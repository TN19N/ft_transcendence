import { Controller, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtGuard } from 'src/auth/guard';

@Controller('chat')
@UseGuards(JwtGuard)
export class ChatController {
    constructor(private chatService: ChatService) {}
}