import { Module } from '@nestjs/common';
import { AuthenticationModule } from './authentication/authentication.module';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { ChatModule } from './chat/chat.module';
import { ConfigurationModule } from './configuration/configuration.module';

@Module({
  imports: [
    AuthenticationModule,
    DatabaseModule,
    ConfigurationModule,
    UserModule,
    GameModule,
    ChatModule,
  ],
})
export class AppModule {}
