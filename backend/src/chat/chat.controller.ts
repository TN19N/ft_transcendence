import { Controller, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { JwtGuard } from './../authentication/guard';
import { ChatService } from './chat.service';
import { ApiOkResponse, ApiQuery, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { GetUserId } from 'src/authentication/decorator';

@ApiTags('chat')
@Controller('chat')
@UseGuards(JwtGuard)
@ApiUnauthorizedResponse({description: "unauthorize"})
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Get('dms')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({description: "dms (last message from each dm) returned! MessageDm[]"})
    async getDms(@GetUserId() userId: string) {
        return this.chatService.getDms(userId);
    }
}