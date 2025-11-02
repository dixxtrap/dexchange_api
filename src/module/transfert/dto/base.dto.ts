import { TRANSFERT_CHANNEL, TRANSFERT_STATUS, Tarnsferts } from '@prisma/client'
import { JsonValue } from '@prisma/client/runtime/library';
import { IsValidStringApi, IsValidStringOptionalApi } from '../../../common/decorator/valid_string';
import { IsValidIntApi } from '../../../common/decorator/valid_int';
import { IsValidEnumApi } from '../../../common/decorator/valid_enum';
import { IsValidPhoneApi } from '../../../common/decorator/valid_phone';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidDateApi } from '../../../common/decorator/valid_date';
class RecipientDTO {
     @IsValidStringApi() name: string;
     @IsValidPhoneApi() phone: string;
}
class MetadataDTO {
     @IsValidStringApi() id: string;
}
export class TransfertDTO implements Omit<Tarnsferts, "recipient" | "metadata"> {
     @IsValidStringApi() ref: string;
     @IsValidStringApi() id: string;
     @IsValidIntApi({ min: 1, max: 1500 }) amount: number;
     @IsValidStringOptionalApi() currency: string | null;
     @IsValidEnumApi(TRANSFERT_CHANNEL) channel: TRANSFERT_CHANNEL;
     @Type(() => RecipientDTO) @ApiProperty({ type: RecipientDTO }) recipient: RecipientDTO;
     @Type(() => MetadataDTO) @ApiProperty({ type: MetadataDTO }) metadata: MetadataDTO;
     @IsValidIntApi() fees: number;
     @ApiProperty() total: number;
     @IsValidEnumApi(TRANSFERT_STATUS) status: TRANSFERT_STATUS;
     @IsValidDateApi() createdAt: Date;
     @IsValidDateApi() updatedAt: Date;
}
