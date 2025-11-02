import { OmitType } from "@nestjs/swagger";
import { TransfertDTO } from "./base.dto";

export class CreateTransfertDTO extends OmitType(TransfertDTO, ['total', 'id', 'createdAt', 'updatedAt', 'fees', 'status', 'ref']) { }
