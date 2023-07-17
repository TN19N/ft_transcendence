import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, NotFoundException, Post, Query, UseGuards } from '@nestjs/common';
import { JwtGuard } from './../authentication/guard';
import { ChatService } from './chat.service';
import { ApiBadRequestResponse, ApiConflictResponse, ApiNotFoundResponse, ApiOkResponse, ApiQuery, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { GetUserId } from 'src/authentication/decorator';
import { UserService } from 'src/user/user.service';
import { GroupDto } from './dto';

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
    @ApiConflictResponse({description: "group with the given name already exists!"})
    @ApiBadRequestResponse({description: "wrong submitted data!"})
    async createGroup(@GetUserId() userId: string, @Body() groupDto: GroupDto) {
        await this.chatService.createGroup(userId, groupDto);
    }

    @Post('group')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({description: "group updated!"})
    @ApiNotFoundResponse({description: "group not found!"})
    @ApiConflictResponse({description: "group with the given name already exists!"})
    @ApiBadRequestResponse({description: "wrong submitted data!"})
    @ApiQuery({name: 'id', description: "group id", type: String})
    async updateGroup(@GetUserId() userId: string, @Body() groupDto: GroupDto, @Query('id') id?: string) {
        if (!id) {
            throw new BadRequestException("'id' query required!")
        }
        
        const group = await this.chatService.getGroup(id);

        if (group) {
            await this.chatService.updateGroup(userId, id, groupDto);
        } else {
            throw new NotFoundException(`Group with id '${id}' not found!`)
        }
    }

    @Post('group/join')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({description: "group joined!"})
    @ApiNotFoundResponse({description: "group not found!"})
    @ApiBadRequestResponse({description: "wrong submitted data!"})
    @ApiUnauthorizedResponse({description: "wrong password!"})
    @ApiConflictResponse({description: "you are already in this group!"})
    async joinGroup(@GetUserId() userId: string, @Body() groupDto: GroupDto) {
        await this.chatService.joinGroup(userId, groupDto);
    }

    @Post('group/leave')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({description: "group left!"})
    @ApiNotFoundResponse({description: "group not found!"})
    @ApiBadRequestResponse({description: "wrong submitted data!"})
    @ApiQuery({name: 'id', description: "group id", type: String})
    async leaveGroup(@GetUserId() userId: string, @Query('id') id?: string) {
        if (!id) {
            throw new BadRequestException("'id' query required!")
        }

        await this.chatService.leaveGroup(userId, id);
    }

    @Get('groups')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({description: "groups returned! Group[{id: , type: , name: , Message[with last one]}]"})
    async getGroups(@GetUserId() userId: string) {
        return this.chatService.getGroups(userId);
    }

    @Get('group/messages')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({description: "group messages returned! Group[messages + users]"})
    @ApiNotFoundResponse({description: "group not found!"})
    @ApiBadRequestResponse({description: "wrong submitted data!"})
    @ApiQuery({name: 'id', description: "group id", type: String})
    async getGroupMessages(@GetUserId() userId: string, @Query('id') id?: string) {
        if (!id) {
            throw new BadRequestException("'id' query required!")
        }

        const messages = this.chatService.getGroupMessages(userId, id);
        if (messages) {
            return messages;
        } else {
            throw new NotFoundException(`Group with id '${id}' not found!`)
        }
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