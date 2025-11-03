import { TRANSFER_CHANNEL, TRANSFER_STATUS } from "@prisma/client/index.js";
import { IsValidEnumOptionalApi } from "../../../common/decorator/valid_enum";
import { IsValidNumberApi, IsValidNumberOptionnalApi } from "../../../common/decorator/valid_number";
import { IsValidIntApi } from "../../../common/decorator/valid_int";
import { IsValidStringOptionalApi } from "../../../common/decorator/valid_string";

export class TransferQueryDTO {
     @IsValidIntApi({ max: 50 }) limit: number;
     @IsValidStringOptionalApi() q: string;
     @IsValidStringOptionalApi() cursor: string;
     @IsValidEnumOptionalApi(TRANSFER_STATUS) status: TRANSFER_STATUS;
     @IsValidEnumOptionalApi(TRANSFER_CHANNEL) channel: TRANSFER_CHANNEL;
     @IsValidNumberOptionnalApi() minAmount: number;
     @IsValidNumberOptionnalApi() maxAmount: number;

}