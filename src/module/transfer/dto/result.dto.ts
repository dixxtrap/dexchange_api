import { ApiProperty } from "@nestjs/swagger";
import { TransferDTO } from "./base.dto";

export class TransferResultDTO {
     @ApiProperty({ type: () => [TransferDTO] }) items: TransferDTO[]
     @ApiProperty() nextCursor: string
}