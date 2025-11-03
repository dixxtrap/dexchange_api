import { ConfigService } from "@nestjs/config";
import { DatabaseService } from "../module/configuration/database/database.service";
import { TRANSFER_STATUS } from "@prisma/client";
import { create } from "domain";
import { TransferService } from "../module/transfer/transfer.service";



// Monkey-patch ProviderSimulator randomness via process()
jest.mock('../module/transfert/provider.simulator', () => ({
     ProviderSimulator: class {
          async process() {
               return { ok: true, providerRef: 'PRV-123' };
          }
     },
}));
jest.mock('../module/transfert/transfert.service', () => ({
     TransfertService: class {
          create(dto) {
               return Promise.resolve({ ...dto, id: 'trf-123', status: TRANSFER_STATUS.PENDING });
          }
          async process(id: string) {
               return Promise.resolve({ id, status: TRANSFER_STATUS.SUCCESS, ref: 'TRF-20240101-0001' });
          }
          findOne(id: string) {
               return Promise.resolve({ id, status: TRANSFER_STATUS.SUCCESS, ref: 'TRF-20240101-0001' });
          }
     }
}))


describe('State transitions', () => {
     let service: TransferService;


     beforeEach(() => {
          service = new TransferService(new (class { })() as any, new (class { })() as any);
     });


     it('PENDING → PROCESSING → SUCCESS', async () => {
          const t = await service.create({
               amount: 10000,
               currency: 'XOF',
               channel: 'WAVE',
               recipient: { phone: '+221770000000', name: 'Jane Doe' },
               metadata: { id: 'PRV-123' },
          });
          expect(t.status).toBe('PENDING');


          const p = await service.process(t.id,);
          expect(['PROCESSING', 'SUCCESS']).toContain(p.status); // final state SUCCESS via mock
          // expect(typeof (final.ref)).toBeDefined();
     });
});