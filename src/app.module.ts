import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigurationModule } from './module/configuration/configuration.module';
import { TransfertModule } from './module/transfert/transfert.module';
import { AuditService } from './module/configuration/audit/audit.service';

@Module({
  imports: [ConfigurationModule, TransfertModule],
  controllers: [AppController],
  providers: [AppService],

})
export class AppModule { }
