import { TRANSFERT_CHANNEL, TRANSFERT_STATUS } from "@prisma/client/index.js";
import { IsValidEnumOptionalApi } from "../../../common/decorator/valid_enum";
import { IsValidNumberApi, IsValidNumberOptionnalApi } from "../../../common/decorator/valid_number";
import { IsValidIntApi } from "../../../common/decorator/valid_int";
import { IsValidStringOptionalApi } from "../../../common/decorator/valid_string";

export class TransfertQueryDTO {
     @IsValidIntApi({ max: 50 }) limit: number;
     @IsValidStringOptionalApi() q: string;
     @IsValidStringOptionalApi() cursor: string;
     @IsValidEnumOptionalApi(TRANSFERT_STATUS) status: TRANSFERT_STATUS;
     @IsValidEnumOptionalApi(TRANSFERT_CHANNEL) channel: TRANSFERT_CHANNEL;
     @IsValidNumberOptionnalApi() minAmount: number;
     @IsValidNumberOptionnalApi() maxAmount: number;

}