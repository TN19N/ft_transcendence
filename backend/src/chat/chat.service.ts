import { Injectable } from '@nestjs/common';
import { ChatRepository } from './chat.repository';
import { MessageDm } from '@prisma/client';

@Injectable()
export class ChatService {
    constructor(private readonly chatRepository: ChatRepository) {}

    public async getDms(userId: string): Promise<MessageDm[]> {
        return await this.chatRepository.getDms(userId);
    }
}