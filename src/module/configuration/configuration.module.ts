import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database/database.service';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { ConfigService } from '@nestjs/config';
import { AuditService } from './audit/audit.service';
import { APP_GUARD } from '@nestjs/core';
import { ApiKeyGuard } from '../../guard/api-key.guard';
@Global()
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [DatabaseService, AuditService, { provide: APP_GUARD, useClass: ApiKeyGuard },],
  exports: [DatabaseService, AuditService]
})
export class ConfigurationModule { }
