import { ApiProperty } from "@nestjs/swagger";
import { TransfertDTO } from "./base.dto";

export class TransfertResult {
     @ApiProperty({ type: () => [TransfertDTO] }) items: TransfertDTO[]
     @ApiProperty() nextCursor: string
}