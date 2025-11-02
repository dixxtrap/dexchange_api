import { applyDecorators } from '@nestjs/common/decorators/core/apply-decorators';
import {
  ApiProperty,
  ApiPropertyOptions,
} from '@nestjs/swagger/dist/decorators';
import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  ValidationOptions,
} from 'class-validator';
import { getOptionalOption } from './option';
type Option = {
  apiPropertyOptions?: ApiPropertyOptions;
  isNumericOptions?: validator.IsNumericOptions;
  validationOptions?: ValidationOptions;
};
export const IsValidStringNumberApi = (option?: Option) => {
  return applyDecorators(
    ApiProperty({ ...option?.apiPropertyOptions, type: String, example: '123' } as ApiPropertyOptions),
    IsNumberString({ no_symbols: true }),
  );
};

export const IsValidStringNumberOptionalApi = (option?: Option) => {
  return applyDecorators(
    IsValidStringNumberApi(getOptionalOption(option)),
    IsOptional(option?.validationOptions),
  );
};

export const IsValidStringNumberRequiredApi = (option?: Option) => {
  return applyDecorators(
    IsValidStringNumberApi(option),
    IsNotEmpty(option?.validationOptions),
  );
};
