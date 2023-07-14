import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { DatabaseModule } from './../database/database.module';
import { ChatRepository } from './chat.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [ChatController],
  providers: [ChatService, ChatRepository],
})
export class ChatModule {}