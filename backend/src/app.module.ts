import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { ChatModule } from './chat/chat.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    ConfigModule,
    UserModule,
    GameModule,
    ChatModule,
  ],
})
export class AppModule {}
