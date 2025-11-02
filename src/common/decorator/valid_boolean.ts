import { applyDecorators } from '@nestjs/common/decorators/core/apply-decorators';
import { ApiPropertyOptions } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { IsBoolean, IsOptional, ValidationOptions } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { getOptionalOption } from "./option";
import { Transform } from 'class-transformer';
type Option = {
  apiPropertyOptions?: ApiPropertyOptions;

  validationOptions?: ValidationOptions;
};
export const IsValidBooleanApi = (option?: Option) => {
  return applyDecorators(
    IsBoolean(option?.validationOptions),
    Transform(({ value }) => { if (typeof value === 'string') { return value === 'true'; } return value; }),
    ApiProperty({ ...option?.apiPropertyOptions, type: "boolean" } as ApiPropertyOptions),
  );
};

export const IsValidBooleanOptionalApi = (option?: Option) => {
  return applyDecorators(
    IsValidBooleanApi(getOptionalOption(option)),
    IsOptional(),
  );
};
