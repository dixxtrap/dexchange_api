# DEXCHANGE – Mini-API NestJS

> **Stack**: NestJS + TypeScript + In-memory repo (switchable DB) · Swagger (/docs) · Tests Jest · API Key Guard · Cursor pagination · Audit logs

---

## 📁 Arborescence

```
.dexchange/
├─ src/
│  ├─ app.module.ts
│  ├─ main.ts
│  ├─ common/
│  │  └─ guards/api-key.guard.ts
│  ├─ audit/
│  │  ├─ audit.module.ts
│  │  └─ audit.service.ts
│  └─ transfers/
│     ├─ transfers.module.ts
│     ├─ transfers.controller.ts
│     ├─ transfers.service.ts
│     ├─ transfers.repository.ts
│     ├─ provider.simulator.ts
│     ├─ dto/
│     │  ├─ create-transfer.dto.ts
│     │  └─ list-transfers.dto.ts
│     └─ entities/
│        └─ transfer.entity.ts
├─ test/
│  ├─ fees.spec.ts
│  └─ transitions.spec.ts
├─ package.json
├─ tsconfig.json
├─ tsconfig.build.json
├─ jest.config.js
├─ .env.example
└─ README.md
```

---

## ⚙️ Code source

### `src/transfers/transfers.repository.ts` (in-memory + Prisma)

```ts
import { Transfer } from "./entities/transfer.entity";

export abstract class TransfersRepository {
  abstract create(
    t: Omit<Transfer, "id" | "createdAt" | "updatedAt"> & {
      id?: string;
      createdAt?: Date;
      updatedAt?: Date;
    }
  ): Promise<Transfer>;
  abstract findById(id: string): Promise<Transfer | undefined>;
  abstract list(params: {
    status?: string;
    channel?: string;
    minAmount?: number;
    maxAmount?: number;
    q?: string;
    limit: number;
    cursor?: string; // base64: createdAt|id
  }): Promise<{ items: Transfer[]; nextCursor?: string }>;
  abstract update(id: string, patch: Partial<Transfer>): Promise<Transfer>;
}

// ---------------- In-memory (par défaut) ----------------
export class InMemoryTransfersRepository extends TransfersRepository {
  private items: Transfer[] = [];

  async create(t: any): Promise<Transfer> {
    const now = t.createdAt ?? new Date();
    const data: Transfer = {
      id: t.id ?? crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      ...t,
    };
    this.items.push(data);
    return data;
  }

  async findById(id: string): Promise<Transfer | undefined> {
    return this.items.find((x) => x.id === id);
  }

  private encodeCursor(d: Date, id: string) {
    return Buffer.from(`${d.toISOString()}|${id}`).toString("base64url");
  }
  private decodeCursor(
    token: string
  ): { createdAt: Date; id: string } | undefined {
    try {
      const [iso, id] = Buffer.from(token, "base64url")
        .toString("utf8")
        .split("|");
      return { createdAt: new Date(iso), id };
    } catch {
      return undefined;
    }
  }

  async list(params: {
    status?: string;
    channel?: string;
    minAmount?: number;
    maxAmount?: number;
    q?: string;
    limit: number;
    cursor?: string;
  }): Promise<{ items: Transfer[]; nextCursor?: string }> {
    const { status, channel, minAmount, maxAmount, q, limit, cursor } = params;

    let data = [...this.items];

    data.sort((a, b) => {
      const d = b.createdAt.getTime() - a.createdAt.getTime();
      return d !== 0 ? d : b.id.localeCompare(a.id);
    });

    if (status) data = data.filter((x) => x.status === status);
    if (channel) data = data.filter((x) => x.channel === channel);
    if (minAmount !== undefined)
      data = data.filter((x) => x.amount >= (minAmount as number));
    if (maxAmount !== undefined)
      data = data.filter((x) => x.amount <= (maxAmount as number));
    if (q) {
      const qq = q.toLowerCase();
      data = data.filter(
        (x) =>
          x.reference.toLowerCase().includes(qq) ||
          x.recipient.name.toLowerCase().includes(qq)
      );
    }

    let startIndex = 0;
    if (cursor) {
      const decoded = this.decodeCursor(cursor);
      if (decoded) {
        const idx = data.findIndex(
          (x) =>
            x.createdAt.getTime() === decoded.createdAt.getTime() &&
            x.id === decoded.id
        );
        if (idx >= 0) startIndex = idx + 1;
      }
    }

    const slice = data.slice(startIndex, startIndex + limit);
    const last = slice[slice.length - 1];
    const nextCursor = last
      ? this.encodeCursor(last.createdAt, last.id)
      : undefined;
    return { items: slice, nextCursor };
  }

  async update(id: string, patch: Partial<Transfer>): Promise<Transfer> {
    const i = this.items.findIndex((x) => x.id === id);
    if (i < 0) throw new Error("Not found");
    const next = {
      ...this.items[i],
      ...patch,
      updatedAt: new Date(),
    } as Transfer;
    this.items[i] = next;
    return next;
  }
}

// ---------------- Prisma (Postgres/MySQL/SQLite) ----------------
import { PrismaClient } from "@prisma/client";

export class PrismaTransfersRepository extends TransfersRepository {
  constructor(private readonly prisma = new PrismaClient()) {
    super();
  }

  async create(t: any): Promise<Transfer> {
    const created = await this.prisma.transfer.create({ data: t });
    return created as any;
  }

  async findById(id: string): Promise<Transfer | undefined> {
    const res = await this.prisma.transfer.findUnique({ where: { id } });
    return (res as any) ?? undefined;
  }

  private encodeCursor(d: Date, id: string) {
    return Buffer.from(`${d.toISOString()}|${id}`).toString("base64url");
  }

  private decodeCursor(
    token?: string
  ): { createdAt: Date; id: string } | undefined {
    if (!token) return undefined;
    try {
      const [iso, id] = Buffer.from(token, "base64url")
        .toString("utf8")
        .split("|");
      return { createdAt: new Date(iso), id };
    } catch {
      return undefined;
    }
  }

  async list(params: {
    status?: string;
    channel?: string;
    minAmount?: number;
    maxAmount?: number;
    q?: string;
    limit: number;
    cursor?: string;
  }): Promise<{ items: Transfer[]; nextCursor?: string }> {
    const { status, channel, minAmount, maxAmount, q, limit, cursor } = params;

    const where: any = {
      ...(status ? { status } : {}),
      ...(channel ? { channel } : {}),
      ...(minAmount !== undefined ? { amount: { gte: minAmount } } : {}),
      ...(maxAmount !== undefined
        ? {
            amount: {
              ...(minAmount !== undefined ? { gte: minAmount } : {}),
              lte: maxAmount,
            },
          }
        : {}),
      ...(q
        ? {
            OR: [
              { reference: { contains: q, mode: "insensitive" } },
              { recipientName: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const decoded = this.decodeCursor(cursor);

    const items = await this.prisma.transfer.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit,
      ...(decoded
        ? {
            skip: 1,
            cursor: {
              createdAt_id: { createdAt: decoded.createdAt, id: decoded.id },
            },
          }
        : {}),
    });

    const last = items[items.length - 1];
    const nextCursor = last
      ? this.encodeCursor(last.createdAt, last.id)
      : undefined;
    return { items: items as any, nextCursor };
  }

  async update(id: string, patch: Partial<Transfer>): Promise<Transfer> {
    const updated = await this.prisma.transfer.update({
      where: { id },
      data: patch,
    });
    return updated as any;
  }
}
```

### `src/prisma/prisma.module.ts`

```ts
import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Global()
@Module({ providers: [PrismaService], exports: [PrismaService] })
export class PrismaModule {}
```

### `src/prisma/prisma.service.ts`

```ts
import { INestApplication, Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
  async enableShutdownHooks(app: INestApplication) {
    this.$on("beforeExit", async () => {
      await app.close();
    });
  }
}
```

### `src/transfers/transfers.module.ts`

```ts
import { Module } from "@nestjs/common";
import { TransfersController } from "./transfers.controller";
import { TransfersService } from "./transfers.service";
import { AuditModule } from "../audit/audit.module";
import { PrismaModule } from "../prisma/prisma.module";
import {
  TransfersRepository,
  PrismaTransfersRepository,
} from "./transfers.repository";

@Module({
  imports: [AuditModule, PrismaModule],
  controllers: [TransfersController],
  providers: [
    TransfersService,
    { provide: TransfersRepository, useClass: PrismaTransfersRepository },
  ],
})
export class TransfersModule {}
```

### Prisma schema – `prisma/schema.prisma`

```prisma
// Datasource & generator
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = env("PRISMA_PROVIDER") // postgresql | mysql | sqlite
  url      = env("DATABASE_URL")
}

model Transfer {
  id           String   @id @default(uuid())
  reference    String   @unique
  amount       Int
  currency     String
  channel      String
  recipientPhone String
  recipientName  String
  metadata     Json?
  fees         Int
  total        Int
  status       String
  providerRef  String?
  errorCode    String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([status, channel])
  @@index([createdAt, id], name: "createdAt_id")
}

model AuditEvent {
  id         String   @id @default(uuid())
  action     String
  transferId String?
  payload    Json?
  at         DateTime @default(now())
}
```

### Mapper: ajuster le service pour Prisma (petite adaptation)

```ts
// src/transfers/transfers.service.ts (extrait)
// ...
  async create(dto: CreateTransferDto) {
    const now = new Date();
    const fees = this.computeFees(dto.amount);
    const t = await (this.repo as any).create({
      reference: this.referenceFor(now),
      amount: dto.amount,
      currency: dto.currency,
      channel: dto.channel,
      recipientPhone: dto.recipient.phone,
      recipientName: dto.recipient.name,
      metadata: dto.metadata || {},
      fees,
      total: dto.amount + fees,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
    });
    this.audit.record({ action: 'TRANSFER_CREATED', transferId: t.id, payload: t });
    return t as any;
  }

  async findOne(id: string) {
    const t: any = await this.repo.findById(id);
    if (!t) throw new NotFoundException('Transfer not found');
    return t;
  }
```

### Prisma seed – `prisma/seed.ts`

```ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.transfer.createMany({
    data: [
      {
        reference: "TRF-20250101-0001",
        amount: 10000,
        currency: "XOF",
        channel: "WAVE",
        recipientPhone: "+221770000001",
        recipientName: "Alice",
        metadata: {},
        fees: 100,
        total: 10100,
        status: "PENDING",
      },
      {
        reference: "TRF-20250101-0002",
        amount: 25000,
        currency: "XOF",
        channel: "OM",
        recipientPhone: "+221770000002",
        recipientName: "Bob",
        metadata: {},
        fees: 200,
        total: 25200,
        status: "SUCCESS",
      },
    ],
  });
}

main().finally(() => prisma.$disconnect());
```

### Scripts & config Prisma – `package.json` (ajouts)

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  },
  "scripts": {
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "seed": "prisma db seed"
  },
  "dependencies": {
    "@prisma/client": "^5.19.0"
  },
  "devDependencies": {
    "prisma": "^5.19.0"
  }
}
```

### `.env.example` (DB)

```env
API_KEY=dev-api-key
PORT=3000
# Prisma
PRISMA_PROVIDER=postgresql
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dexchange
```

### (Bonus) `docker-compose.yml`

```yaml
version: "3.9"
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: dexchange
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata: {}
```

### README – Ajouts Prisma

````md
## 🗄️ Prisma / Base de données

1. Démarrer une DB (Postgres recommandé)
   ```bash
   docker compose up -d
   ```
````

2. Configurer `.env`
3. Générer le client & appliquer le schéma
   ```bash
   npm run prisma:generate
   npm run prisma:migrate -- --name init
   ```
4. (Optionnel) Seed
   ```bash
   npm run seed
   ```

Par défaut, `TransfersModule` utilise Prisma (`PrismaTransfersRepository`). Pour repasser en mémoire, remplacez le provider dans `transfers.module.ts` par:

```ts
{ provide: TransfersRepository, useClass: InMemoryTransfersRepository }
```

````

### `src/transfers/provider.simulator.ts`
```ts
export class ProviderSimulator {
  constructor(private readonly delayMs = 0) {}

  async process(): Promise<{ ok: true; providerRef: string } | { ok: false; errorCode: string }> {
    if (this.delayMs) await new Promise((res) => setTimeout(res, this.delayMs));
    const r = Math.random();
    if (r < 0.7) return { ok: true, providerRef: `PRV-${Math.floor(Math.random() * 1e9)}` };
    return { ok: false, errorCode: `ERR-${Math.floor(Math.random() * 999)}` };
  }
}
````

### `src/transfers/transfers.service.ts`

```ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { AuditService } from "../audit/audit.service";
import { CreateTransferDto } from "./dto/create-transfer.dto";
import {
  InMemoryTransfersRepository,
  TransfersRepository,
} from "./transfers.repository";
import { Transfer } from "./entities/transfer.entity";
import { ProviderSimulator } from "./provider.simulator";

@Injectable()
export class TransfersService {
  constructor(
    private readonly repo: TransfersRepository = new InMemoryTransfersRepository(),
    private readonly audit: AuditService
  ) {}

  private referenceFor(now = new Date()): string {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const serial = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `TRF-${y}${m}${d}-${serial}`;
  }

  // Règle frais: 0.8% arrondi sup, min 100, max 1500
  computeFees(amount: number): number {
    const pct = Math.ceil(amount * 0.008);
    return Math.max(100, Math.min(1500, pct));
  }

  async create(dto: CreateTransferDto): Promise<Transfer> {
    const now = new Date();
    const fees = this.computeFees(dto.amount);
    const t: Transfer = {
      id: crypto.randomUUID(),
      reference: this.referenceFor(now),
      amount: dto.amount,
      currency: dto.currency,
      channel: dto.channel,
      recipient: dto.recipient,
      metadata: dto.metadata || {},
      fees,
      total: dto.amount + fees,
      status: "PENDING",
      createdAt: now,
      updatedAt: now,
    };
    await this.repo.create(t);
    this.audit.record({
      action: "TRANSFER_CREATED",
      transferId: t.id,
      payload: t,
    });
    return t;
  }

  async findOne(id: string): Promise<Transfer> {
    const t = await this.repo.findById(id);
    if (!t) throw new NotFoundException("Transfer not found");
    return t;
  }

  async list(params: {
    status?: string;
    channel?: string;
    minAmount?: number;
    maxAmount?: number;
    q?: string;
    limit: number;
    cursor?: string;
  }) {
    return this.repo.list(params);
  }

  async cancel(id: string): Promise<Transfer> {
    const t = await this.findOne(id);
    if (t.status !== "PENDING")
      throw new ConflictException("Only PENDING can be canceled");
    const next = await this.repo.update(id, { status: "CANCELED" });
    this.audit.record({
      action: "TRANSFER_CANCELED",
      transferId: id,
      payload: { from: t.status },
    });
    return next;
  }

  async process(id: string, simulateDelayMs = 2000): Promise<Transfer> {
    const t = await this.findOne(id);
    if (["SUCCESS", "FAILED", "CANCELED"].includes(t.status))
      throw new ConflictException("Transfer already finalized");

    // PENDING -> PROCESSING
    const processing = await this.repo.update(id, { status: "PROCESSING" });
    this.audit.record({ action: "TRANSFER_PROCESSING", transferId: id });

    // Simulation provider
    const provider = new ProviderSimulator(simulateDelayMs);
    const res = await provider.process();

    if (res.ok) {
      const ok = await this.repo.update(id, {
        status: "SUCCESS",
        providerRef: res.providerRef,
      });
      this.audit.record({
        action: "TRANSFER_SUCCESS",
        transferId: id,
        payload: { providerRef: res.providerRef },
      });
      return ok;
    } else {
      const ko = await this.repo.update(id, {
        status: "FAILED",
        errorCode: res.errorCode,
      });
      this.audit.record({
        action: "TRANSFER_FAILED",
        transferId: id,
        payload: { errorCode: res.errorCode },
      });
      return ko;
    }
  }
}
```

### `src/transfers/transfers.controller.ts`

```ts
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiHeader, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ApiKeyGuard } from "../common/guards/api-key.guard";
import { TransfersService } from "./transfers.service";
import { CreateTransferDto } from "./dto/create-transfer.dto";
import { ListTransfersDto } from "./dto/list-transfers.dto";

@ApiTags("transfers")
@ApiHeader({ name: "x-api-key", description: "API key", required: true })
@UseGuards(ApiKeyGuard)
@Controller("transfers")
export class TransfersController {
  constructor(private readonly service: TransfersService) {}

  @Post()
  @ApiResponse({ status: 201, description: "Transfer created" })
  create(@Body() dto: CreateTransferDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiResponse({ status: 200, description: "List transfers" })
  list(@Query() q: ListTransfersDto) {
    const {
      status,
      channel,
      minAmount,
      maxAmount,
      q: search,
      limit = 20,
      cursor,
    } = q;
    return this.service.list({
      status,
      channel,
      minAmount,
      maxAmount,
      q: search,
      limit,
      cursor,
    });
  }

  @Get(":id")
  @ApiResponse({ status: 200, description: "Get transfer by id" })
  getOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }

  @Post(":id/process")
  @ApiResponse({ status: 200, description: "Process transfer simulation" })
  process(@Param("id") id: string) {
    return this.service.process(id, 2000); // 2s pour le réalisme
  }

  @Post(":id/cancel")
  @ApiResponse({ status: 200, description: "Cancel transfer (PENDING only)" })
  cancel(@Param("id") id: string) {
    return this.service.cancel(id);
  }
}
```

### `src/transfers/transfers.module.ts`

```ts
import { Module } from "@nestjs/common";
import { TransfersController } from "./transfers.controller";
import { TransfersService } from "./transfers.service";
import { AuditModule } from "../audit/audit.module";

@Module({
  imports: [AuditModule],
  controllers: [TransfersController],
  providers: [TransfersService],
})
export class TransfersModule {}
```

---

## 🧪 Tests

### `test/fees.spec.ts`

```ts
import { TransfersService } from "../src/transfers/transfers.service";
import { AuditService } from "../src/audit/audit.service";

describe("Fees calculation", () => {
  const service = new TransfersService(
    new (class {})() as any,
    new AuditService()
  );

  it("applies 0.8% rounded up with bounds [100, 1500]", () => {
    const cases: Array<[number, number]> = [
      [1000, 100], // 8 -> ceil 8 -> min 100
      [12500, 100], // 100 => exactly min
      [200000, 1500], // 1600 -> max 1500
      [123456, Math.min(1500, Math.ceil(123456 * 0.008))],
    ];

    for (const [amount, expected] of cases) {
      expect(service.computeFees(amount)).toBe(expected);
    }
  });
});
```

### `test/transitions.spec.ts`

```ts
import { TransfersService } from "../src/transfers/transfers.service";
import { AuditService } from "../src/audit/audit.service";

// Monkey-patch ProviderSimulator randomness via process()
jest.mock("../src/transfers/provider.simulator", () => ({
  ProviderSimulator: class {
    async process() {
      return { ok: true, providerRef: "PRV-123" };
    }
  },
}));

describe("State transitions", () => {
  let service: TransfersService;

  beforeEach(() => {
    service = new TransfersService(undefined as any, new AuditService());
  });

  it("PENDING → PROCESSING → SUCCESS", async () => {
    const t = await service.create({
      amount: 10000,
      currency: "XOF",
      channel: "WAVE",
      recipient: { phone: "+221770000000", name: "Jane Doe" },
      metadata: {},
    });
    expect(t.status).toBe("PENDING");

    const p = await service.process(t.id, 0);
    expect(["PROCESSING", "SUCCESS"]).toContain(p.status); // final state SUCCESS via mock

    const final = await service.findOne(t.id);
    expect(final.status).toBe("SUCCESS");
    expect(final.providerRef).toBe("PRV-123");
  });
});
```

---

## 📦 Config & scripts

### `package.json`

```json
{
  "name": "dexchange-mini-api",
  "version": "1.0.0",
  "description": "Mini-API de transferts (NestJS)",
  "scripts": {
    "start": "nest start",
    "start:dev": "nest start --watch",
    "build": "nest build",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint ."
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/swagger": "^7.3.0",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/jest": "^29.5.5",
    "@types/node": "^20.11.0",
    "eslint": "^8.56.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "ts-node": "^10.9.2",
    "typescript": "^5.4.0"
  }
}
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "es2021",
    "sourceMap": true,
    "outDir": "dist",
    "baseUrl": "./",
    "incremental": true,
    "strict": true,
    "skipLibCheck": true
  },
  "exclude": ["node_modules", "dist", "test", "**/*spec.ts"]
}
```

### `tsconfig.build.json`

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*.spec.ts"]
}
```

### `jest.config.js`

```js
module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: ["src/**/*.(t|j)s"],
  coverageDirectory: "./coverage",
  testEnvironment: "node",
};
```

### `.env.example`

```env
API_KEY=dev-api-key
PORT=3000
```

---

## 📘 README.md

````md
# DEXCHANGE – Mini-API NestJS

Mini-API de transferts avec API Key, règles de frais, transitions d’état, pagination par curseur, logs d’audit, Swagger, et tests.

## 🚀 Setup

```bash
npm i
cp .env.example .env
npm run start:dev
# Swagger: http://localhost:${PORT:-3000}/docs
```
````

## 🔐 Auth

Tous les endpoints exigent `x-api-key`.

- Sans header → 401
- Mauvaise clé → 403

## 🧮 Règles de frais

- `fees = ceil(0.8% * amount)`
- bornes: `min=100`, `max=1500`
- `total = amount + fees`

## 🧭 Endpoints

### POST /transfers

```json
{
  "amount": 12500,
  "currency": "XOF",
  "channel": "WAVE",
  "recipient": { "phone": "+221770000000", "name": "Jane Doe" },
  "metadata": { "orderId": "ABC-123" }
}
```

Réponse: objet `Transfer` (status=PENDING, reference TRF-YYYYMMDD-XXXX)

### GET /transfers

Query: `status`, `channel`, `minAmount`, `maxAmount`, `q`, `limit` (<=50), `cursor`
Réponse:

```json
{ "items": [ ... ], "nextCursor": "..." }
```

### GET /transfers/:id

- 404 si introuvable

### POST /transfers/:id/process

Flux: `PENDING → PROCESSING → SUCCESS | FAILED` (70% succès)

- 409 si déjà finalisé (`SUCCESS|FAILED|CANCELED`)

### POST /transfers/:id/cancel

- Autorisé uniquement depuis `PENDING`, sinon 409

## 🧾 Audit

Événements enregistrés: `TRANSFER_CREATED`, `TRANSFER_PROCESSING`, `TRANSFER_SUCCESS`, `TRANSFER_FAILED`, `TRANSFER_CANCELED`

## 🧪 Tests

```bash
npm test
```

- `fees.spec.ts`: calcule des frais
- `transitions.spec.ts`: PENDING → PROCESSING → SUCCESS (mock provider)

## 🔁 Pagination par curseur

- Ordre: `createdAt DESC, id DESC`
- `nextCursor` = base64url(`createdAt|id`) du dernier item renvoyé
- Pour la page suivante, renvoyer `cursor=nextCursor`

## 🧱 Choix techniques

- Repo mémoire pour simplicité & vitesse. Interface `TransfersRepository` permet de brancher un vrai stockage (Mongo/Postgres) ultérieurement.
- Guard API key global par contrôleur pour rester explicite dans Swagger.
- DTO + ValidationPipe pour des erreurs 400 claires.
- Provider simulator découplé + délai (2s) pour réalisme.

## ➕ Améliorations futures

- Persistance (Prisma + Postgres) et seed `npm run seed`
- Adapters providers (`wave`, `om`) avec interfaces
- Exposition d’un endpoint `/audit` (lecture)
- Observabilité (pino, request-id) et traçage
- Idempotence sur `POST /transfers` via `metadata.orderId`

```

```
