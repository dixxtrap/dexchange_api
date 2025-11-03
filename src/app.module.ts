import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigurationModule } from './module/configuration/configuration.module';
import { TransferModule } from './module/transfer/transfer.module';
import { AuditService } from './module/configuration/audit/audit.service';

@Module({
  imports: [ConfigurationModule, TransferModule],
  controllers: [AppController],
  providers: [AppService],

})
export class AppModule { }
