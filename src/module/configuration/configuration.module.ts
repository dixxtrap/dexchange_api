import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database/database.service';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { ConfigService } from '@nestjs/config';
import { AuditService } from './audit/audit.service';
@Global()
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [DatabaseService, AuditService],
  exports: [DatabaseService, AuditService]
})
export class ConfigurationModule { }
