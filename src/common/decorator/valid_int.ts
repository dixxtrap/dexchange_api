import { applyDecorators } from '@nestjs/common/decorators/core/apply-decorators';
import {
  ApiProperty,
  ApiPropertyOptions,
} from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { IsInt, IsNumberOptions, IsOptional, Max, Min } from 'class-validator';
import { ValidationOptions } from 'class-validator/types/decorator/ValidationOptions';
import { getOptionalOption } from "./option";
import { Transform } from 'class-transformer';

type Option = {
  apiPropertyOptions?: ApiPropertyOptions;
  isNumberOptions?: IsNumberOptions;
  validationOptions?: ValidationOptions;
  min?: number;
  max?: number;
};
export const IsValidIntApi = (option?: Option) => {
  return applyDecorators(
    Transform(({ value }) => {
      console.log(value)
      return (value && Array.isArray(value)) ? value.map(e => parseInt(e)) : ((value === undefined || !value) ? undefined : parseInt(value))
    }),

    ApiProperty({ example: 1, ...option?.apiPropertyOptions, type: Number } as ApiPropertyOptions),
    IsInt(option?.validationOptions),
    ...(option?.min ? [Min(option?.min!)] : []),
    ...(option?.max ? [Max(option?.max!)] : [])
  );
};

export const IsValidIntOptionnalApi = (option?: Option) => {
  return applyDecorators(
    IsValidIntApi(getOptionalOption({ apiPropertyOptions: { ...option?.apiPropertyOptions, required: false } as ApiPropertyOptions, validationOptions: option?.validationOptions })),
    IsOptional({ each: option?.validationOptions?.each ?? false, }),
  );
};
export const IsValidDecimalApi = () => {
  return applyDecorators(
    IsValidIntOptionnalApi({
      apiPropertyOptions: { type: Number },
    }),
  );
};

export const IsValidIntArrayApi = (option?: Option) => {
  return applyDecorators(
    IsValidIntApi(option),
    IsInt(option?.validationOptions),

  );
};


export const IsValidIntOptionnalArrayApi = (option?: Option) => {
  return applyDecorators(
    IsValidIntOptionnalArrayApi(option),
    IsOptional(),
  )
}