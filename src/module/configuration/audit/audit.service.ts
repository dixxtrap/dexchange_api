import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AuditService {
     constructor(private readonly _db: DatabaseService) { }
}
