import { applyDecorators } from '@nestjs/common/decorators/core/apply-decorators';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsDateString,
  IsOptional,
  ValidationOptions,
} from 'class-validator';
import { ApiPropertyOptions } from '@nestjs/swagger/dist/decorators';
import { getOptionalOption } from './option';
import { Transform } from 'class-transformer';
type Option = {
  apiPropertyOptions?: ApiPropertyOptions;
  dateOptions?: validator.IsISO8601Options;
  validationOptions?: ValidationOptions;
};
export const IsValidDateApi = (option?: Option) => {
  return applyDecorators(
    Transform(({ value }) => new Date(value)),
    IsDate(option?.validationOptions),
    ApiProperty({ ...option?.apiPropertyOptions, example: '2023-01-01' } as ApiPropertyOptions)
  );
};

export const IsValidDateOptionalApi = (option?: Option) => {
  return applyDecorators(
    Transform(({ value }) => new Date(value)),
    IsValidDateApi(getOptionalOption(option)),
    IsOptional(),
  );
};
