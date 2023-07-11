import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthenticationModule } from './../authentication/authentication.module';
import { ConfigModule } from '@nestjs/config';
import { UserGateway } from './user.gateway';
import { UserRepository } from './user.repository';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [
    forwardRef(() => AuthenticationModule), 
    ConfigModule,
    DatabaseModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserGateway, UserRepository],
  exports: [UserService],
})
export class UserModule {}