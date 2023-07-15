import { Body, Controller, Get, HttpCode, HttpStatus, NotFoundException, Post, Query, UseGuards } from '@nestjs/common';
import { JwtGuard } from './../authentication/guard';
import { ChatService } from './chat.service';
import { ApiOkResponse, ApiQuery, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { GetUserId } from 'src/authentication/decorator';
import { UserService } from 'src/user/user.service';
import { CreateGroupDto } from './dto';

@ApiTags('chat')
@Controller('chat')
@UseGuards(JwtGuard)
@ApiUnauthorizedResponse({description: "unauthorize"})
export class ChatController {
    constructor(
        private readonly chatService: ChatService,
        private readonly userService: UserService
    ) {}

    @Post('newGroup')
    @HttpCode(HttpStatus.CREATED)
    @ApiOkResponse({description: "group created!"})
    async createGroup(@GetUserId() userId: string, @Body() createGroupDto: CreateGroupDto) {
        await this.chatService.createGroup(userId, createGroupDto);
    }

    @Get('dm')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({description: "dm with the given user returned! MessageDm[]"})
    async getDm(@GetUserId() userId: string, @Query('id') id: string) {
        const user = await this.userService.getUser(id);

        if (user) {
            return this.chatService.getDm(userId, id);
        } else {
            throw new NotFoundException(`User with id '${id}' not found!`)
        }
    }

    @Get('dms')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({description: "dms (last message from each dm) returned! MessageDm[]"})
    async getDms(@GetUserId() userId: string) {
        return this.chatService.getDms(userId);
    }
}