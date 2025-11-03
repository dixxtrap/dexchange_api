import { HttpException, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateTransferDTO } from './dto/create-transfert.dto';
import { UpdateTransferDTO } from './dto/update-transfert.dto';
import { DatabaseService } from '../configuration/database/database.service';
import { TransferQueryDTO } from './dto/filter.dto';
import { Prisma, TRANSFER_CHANNEL, TRANSFER_STATUS } from '@prisma/client/index.js';
import { ConfigService } from '@nestjs/config';
import { ProviderSimulator } from './provider.simulator';
import { HttpExceptionCode, WsMessage } from '../../common/helper/ws_message';
import { firstnames, lastnames, prefix } from '../../common/helper/utils';
import { AuditService } from '../configuration/audit/audit.service';

@Injectable()
export class TransferService implements OnModuleInit {
  constructor(private readonly _db: DatabaseService, private readonly _auditService: AuditService, private readonly _config: ConfigService) { }
  onModuleInit() {
    if (this._config.get<boolean>('WITH_SEED', false))
      this.seed()
  }

  computeFees(amount: number): number {
    const pct = amount * 0.18;
    return pct;
  }
  async seed() {


    await this._db.transfers.count().then(async count => {
      if (count >= 10) return null
      for (let index = 0; index < 10; index++) {
        const channel: TRANSFER_CHANNEL = Math.random() > 0.7 ? TRANSFER_CHANNEL.OM : TRANSFER_CHANNEL.WAVE;
        const name = `${firstnames[Math.round(Math.random() * 10) % 5]}  ${lastnames[Math.round(Math.random() * 10) % 5]}`;
        const phone = `221${prefix[Math.round(Math.random() * 10) % 5]}${Math.round(Math.random() * 10e6)}`;
        const amount = Math.random() * 1500;
        await this.create({ amount, channel, currency: "XOF", recipient: { name, phone }, metadata: { id: this.generateReference(channel) } });
      }
    });

  }
  private generateReference(prefix: String): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const serial = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${y}${m}${d}-${serial}`;
  }
  create(dto: CreateTransferDTO) {
    // decomposed formule : amount + (amount *18) / 100
    const total = dto.amount * this.computeFees(dto.amount)
    return this._db.transfers.create({
      data: {
        ...dto, metadata: { ...dto.metadata },
        recipient: { ...dto.recipient }, total, fees: total - dto.amount,
        status: TRANSFER_STATUS.PENDING, ref: this.generateReference("TRF")
      },
    }).then(val => {
      return this._auditService.record({ action: "TRANSFER_CREATED", transferId: val.id, payload: { ...val } }).then(() => val);
    })
  }

  findAll(dto: TransferQueryDTO) {
    const { channel, maxAmount, minAmount, status, cursor, limit, q } = dto;
    const where: Prisma.TransfersWhereInput = {
      ...(q && { OR: [{ ref: { equals: q } }, { recipient: { path: ['name'], string_contains: q, mode: 'insensitive' } }] }),
      ... (channel && { channel: { equals: channel } }),
      ... (status && { status: status }),
      amount: {
        ...(minAmount && { gte: minAmount }),
        ...(maxAmount && { lte: maxAmount })
      }
    }
    return this._db.transfers.findMany({
      where, take: limit,
      skip: cursor ? 1 : 0,
      ...(cursor ? { cursor: { id: cursor } } : {}),
    }).then(val => ({ items: val, nextCursor: val.length > 0 ? val[val.length - 1].id : null }));
  }

  findOne(id: string) {
    return this._db.transfers.findFirstOrThrow({ where: { id: { equals: id } } });
  }

  update(id: string, dto: UpdateTransferDTO) {
    const { recipient, metadata, ...rest } = dto
    return this._db.transfers.update({ where: { id }, data: { ...rest, recipient: recipient && { ...recipient }, metadata: metadata && { ...metadata } } });
  }
  async canceled(id: string) {
    const transfer = await this._db.transfers.findFirstOrThrow({ where: { id } })
    if (transfer.status !== TRANSFER_STATUS.PENDING) throw new WsMessage(HttpExceptionCode.CANNOT_BE_CANCELED)
    return this._db.transfers.update({ where: { id }, data: { status: TRANSFER_STATUS.CANCELED } })
  }
  remove(id: string) {
    return this._db.transfers.delete({ where: { id } });
  }
  async process(id: string) {
    const transfer = await this._db.transfers.findFirstOrThrow({ where: { id } });
    if (([TRANSFER_STATUS.FAILED, TRANSFER_STATUS.CANCELED, TRANSFER_STATUS.SUCCESS] as TRANSFER_STATUS[]).includes(transfer.status)) {
      throw new WsMessage(HttpExceptionCode.FINAL_STATUS);
    }
    const simulateDelayMs = 2000
    await this._db.transfers.update({ where: { id }, data: { status: TRANSFER_STATUS.PROCESSING } }).then(async val => {
      await this._auditService.record({ action: 'TRANSFER_PROCESSING', transferId: val.id, payload: { ...val } })
    })

    const provider = new ProviderSimulator(simulateDelayMs);
    const res = await provider.process();

    if (res.ok)
      return this._db.transfers.update({ where: { id }, data: { status: TRANSFER_STATUS.SUCCESS } }).then(async val => {
        await this._auditService.record({ action: 'TRANSFER_SUCCESS', transferId: val.id, payload: { ...val } })
        return val;
      })
    else
      return this._db.transfers.update({ where: { id }, data: { status: TRANSFER_STATUS.FAILED } }).then(async val => {
        await this._auditService.record({ action: 'TRANSFER_FAILED', transferId: val.id, payload: { ...val } })
        return val;
      })
  }
}
