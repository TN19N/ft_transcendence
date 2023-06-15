import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { ConfigModule } from './../config/config.module';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [DatabaseService],
  exports: [DatabaseService]
})
export class DatabaseModule {}