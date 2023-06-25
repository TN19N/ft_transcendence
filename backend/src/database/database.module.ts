import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { ConfigurationModule } from '../configuration/configuration.module';

@Global()
@Module({
  imports: [ConfigurationModule],
  providers: [DatabaseService],
  exports: [DatabaseService]
})
export class DatabaseModule {}