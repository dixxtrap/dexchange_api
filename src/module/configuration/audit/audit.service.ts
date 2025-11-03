import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AuditService {
     constructor(private readonly _db: DatabaseService) { }
     record(params: { action: 'TRANSFER_CREATED' | 'TRANSFER_PROCESSING' | 'TRANSFER_SUCCESS' | 'TRANSFER_FAILED' | 'TRANSFER_CANCELED'; transferId?: string; payload?: any; }) {
          return this._db.auditEvent.create({
               data: {
                    action: params.action as any,
                    transferId: params.transferId,
                    payload: params.payload ?? {},
               },
          });
     }
}
