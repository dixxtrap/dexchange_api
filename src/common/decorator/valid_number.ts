import { applyDecorators } from '@nestjs/common/decorators/core/apply-decorators';
import {
  ApiProperty,
  ApiPropertyOptions,
} from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { IsNumber, IsNumberOptions, IsOptional } from 'class-validator';
import { ValidationOptions } from 'class-validator/types/decorator/ValidationOptions';
import { getOptionalOption } from "./option";
import { Transform } from 'class-transformer';

type Option = {
  apiPropertyOptions?: ApiPropertyOptions;
  isNumberOptions?: IsNumberOptions;
  validationOptions?: ValidationOptions;
};
export const IsValidNumberApi = (option?: Option) => {
  return applyDecorators(
    ApiProperty({ example: 1, ...option?.apiPropertyOptions, type: Number } as ApiPropertyOptions),
    Transform(({ value }) => (value === undefined || !value ? undefined : Number(value))),
    IsNumber(option?.isNumberOptions, option?.validationOptions),
  );
};

export const IsValidNumberOptionnalApi = (option?: Option) => {
  return applyDecorators(
    IsValidNumberApi(getOptionalOption({ apiPropertyOptions: { ...option?.apiPropertyOptions, required: false } as ApiPropertyOptions, validationOptions: option?.validationOptions })),
    IsOptional(),
  );
};
export const IsValidDecimalApi = () => {
  return applyDecorators(
    IsValidNumberOptionnalApi({
      apiPropertyOptions: { type: Number },
    }),
  );
};

export const IsValidNumberOptionnalArrayApi = (option?: Option) => {
  return applyDecorators(
    IsValidNumberApi(option),
    IsNumber(option?.isNumberOptions, option?.validationOptions),
    IsOptional(),
  );
};


export const IsValidIntOptionnalArrayApi = (option?: Option) => {
  return applyDecorators(
    IsValidNumberOptionnalArrayApi(option)
  )
}