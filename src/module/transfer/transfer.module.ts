import { Module } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { TransfertController } from './transfer.controller';

@Module({
  controllers: [TransfertController],
  providers: [TransferService],
})
export class TransferModule { }
