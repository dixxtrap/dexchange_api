import { Module } from '@nestjs/common';
import { TransfertService } from './transfert.service';
import { TransfertController } from './transfert.controller';

@Module({
  controllers: [TransfertController],
  providers: [TransfertService],
})
export class TransfertModule {}
