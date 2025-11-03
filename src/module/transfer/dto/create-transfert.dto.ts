import { OmitType } from "@nestjs/swagger";
import { TransferDTO } from "./base.dto";

export class CreateTransferDTO extends OmitType(TransferDTO, ['total', 'id', 'createdAt', 'updatedAt', 'fees', 'status', 'ref']) { }
