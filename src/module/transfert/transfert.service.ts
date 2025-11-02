import { HttpException, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateTransfertDTO } from './dto/create-transfert.dto';
import { UpdateTransfertDTO } from './dto/update-transfert.dto';
import { DatabaseService } from '../configuration/database/database.service';
import { TransfertQueryDTO } from './dto/filter.dto';
import { Prisma, TRANSFERT_CHANNEL, TRANSFERT_STATUS } from '@prisma/client/index.js';
import { ConfigService } from '@nestjs/config';
import { ProviderSimulator } from './provider.simulator';
import { HttpExceptionCode, WsMessage } from '../../common/helper/ws_message';
import { firstnames, lastnames, prefix } from '../../common/helper/utils';

@Injectable()
export class TransfertService implements OnModuleInit {
  constructor(private readonly _db: DatabaseService, private readonly _config: ConfigService) { }
  onModuleInit() {
    if (this._config.get<boolean>('WITH_SEED', false))
      this.seed()
  }

  computeFees(amount: number): number {
    const pct = amount * 0.18;
    return pct;
  }
  async seed() {


    await this._db.tarnsferts.count().then(async count => {
      if (count >= 10) return null
      for (let index = 0; index < 10; index++) {
        const channel: TRANSFERT_CHANNEL = Math.random() > 0.7 ? TRANSFERT_CHANNEL.OM : TRANSFERT_CHANNEL.WAVE;
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
  create(dto: CreateTransfertDTO) {
    // decomposed formule : amount + (amount *18) / 100
    const total = dto.amount * (1.18)
    return this._db.tarnsferts.create({ data: { ...dto, metadata: { ...dto.metadata }, recipient: { ...dto.recipient }, total, fees: total - dto.amount, status: TRANSFERT_STATUS.PENDING, ref: this.generateReference("TRF") }, })
  }

  findAll(dto: TransfertQueryDTO) {
    const { channel, maxAmount, minAmount, status, cursor, limit, q } = dto;
    const where: Prisma.TarnsfertsWhereInput = {
      ...(q && { OR: [{ ref: { equals: q } }, { recipient: { path: ['name'], string_contains: q, mode: 'insensitive' } }] }),
      ... (channel && { channel: { equals: channel } }),
      ... (status && { status: status }),
      amount: {
        ...(minAmount && { gte: minAmount }),
        ...(maxAmount && { lte: maxAmount })
      }
    }
    return this._db.tarnsferts.findMany({
      where, take: limit,
      skip: cursor ? 1 : 0,
      ...(cursor ? { cursor: { id: cursor } } : {}),
    }).then(val => ({ items: val, nextCursor: val.length > 0 ? val[val.length - 1].id : null }));
  }

  findOne(id: string) {
    return this._db.tarnsferts.findFirstOrThrow({ where: { id: { equals: id } } });
  }

  update(id: string, dto: UpdateTransfertDTO) {
    const { recipient, metadata, ...rest } = dto
    return this._db.tarnsferts.update({ where: { id }, data: { ...rest, recipient: recipient && { ...recipient }, metadata: metadata && { ...metadata } } });
  }
  async canceled(id: string) {
    const transfert = await this._db.tarnsferts.findFirstOrThrow({ where: { id } })
    if (transfert.status !== TRANSFERT_STATUS.PENDING) throw new WsMessage(HttpExceptionCode.CANNOT_BE_CANCELED)
    return this._db.tarnsferts.update({ where: { id }, data: { status: TRANSFERT_STATUS.CANCELED } })
  }
  remove(id: string) {
    return this._db.tarnsferts.delete({ where: { id } });
  }
  async process(id: string) {
    const transfert = await this._db.tarnsferts.findFirstOrThrow({ where: { id } });
    if (([TRANSFERT_STATUS.FAILED, TRANSFERT_STATUS.CANCELED, TRANSFERT_STATUS.SUCCESS] as TRANSFERT_STATUS[]).includes(transfert.status)) {
      throw new WsMessage(HttpExceptionCode.FINAL_STATUS);
    }
    const simulateDelayMs = 2000
    await this._db.tarnsferts.update({ where: { id }, data: { status: TRANSFERT_STATUS.PROCESSING } })
    const provider = new ProviderSimulator(simulateDelayMs);
    const res = await provider.process();
    if (res.ok)
      return this._db.tarnsferts.update({ where: { id }, data: { status: TRANSFERT_STATUS.SUCCESS } })
    else
      return this._db.tarnsferts.update({ where: { id }, data: { status: TRANSFERT_STATUS.FAILED } })
  }
}
