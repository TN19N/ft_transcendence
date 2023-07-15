import { BadRequestException, Injectable } from '@nestjs/common';
import { ChatRepository } from './chat.repository';
import { Group, GroupType, MessageDm } from '@prisma/client';
import { CreateGroupDto } from './dto';
import * as bcrypt from 'bcrypt'

@Injectable()
export class ChatService {
    constructor(private readonly chatRepository: ChatRepository) {}

    public async createGroup(userId: string, createGroupDto: CreateGroupDto): Promise<Group> {
        if (createGroupDto.type === GroupType.PROTECTED) {
            if (!createGroupDto.password) {
                throw new BadRequestException("password required for protected groups!")
            }

            createGroupDto.password = await bcrypt.hash(createGroupDto.password, 10);
        }

        return this.chatRepository.createGroup({
            data: {
                ...createGroupDto,
                owner:  {connect: {id: userId}},
                users:  {connect: {id: userId}},
                admins: {connect: {id: userId}}
            }
        });
    }

    public async createMessageDm(senderId: string, receiverId: string, message: string) {
        return await this.chatRepository.createMessageDM({
            data: {
                sender: { connect: { id: senderId } },
                receiver: { connect: { id: receiverId } },
                content: message,
            }
        });
    }

    public async getDm(userId: string, id: string): Promise<MessageDm[]> {
        return await this.chatRepository.getDms({
            where: {
                OR: [
                    { senderId: userId, receiverId: id },
                    { senderId: id,     receiverId: userId },
                ],
            },
            orderBy: {
                createdAt: 'asc',
            }
        });
    }

    public async getDms(userId: string): Promise<MessageDm[]> {
        const messagesDms = await this.chatRepository.getDms({
            where: {
                OR: [
                    {senderId: userId},
                    {receiverId: userId},
                ]
            },
            orderBy: {
                createdAt: 'desc',
            }
        });

        // Filter and Keep just the last message from each dm
        const messagesDmFiltered: MessageDm[] = [];
        const dmPast = new Set<string>();

        for (const messageDm of messagesDms) {
            const uniqueKey = `${messageDm.senderId}|${messageDm.receiverId}`;
            if (!dmPast.has(uniqueKey)) {
                dmPast.add(uniqueKey);
                dmPast.add([...uniqueKey].reverse().join(''));
                messagesDmFiltered.push(messageDm);
            }
        }

        return messagesDmFiltered;
    }
}