import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthenticationModule } from './../authentication/authentication.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    forwardRef(() => AuthenticationModule), 
    ConfigModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}