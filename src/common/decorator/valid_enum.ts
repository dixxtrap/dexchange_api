import { applyDecorators } from "@nestjs/common/decorators/core/apply-decorators";
import { ApiProperty, ApiPropertyOptions } from "@nestjs/swagger/dist/decorators/api-property.decorator";
import { IsEnum, IsIn, IsOptional } from "class-validator";
import { ValidationOptions } from "class-validator/types/decorator/ValidationOptions";

interface Option {
  apiPropertyOptions?: ApiPropertyOptions,
  validationOptions?: ValidationOptions
}
export const IsValidEnumApi = <T extends Object>(values: T, option?: Option,) => {
  return applyDecorators(
    IsIn(Object.values(values), option?.validationOptions),
    ApiProperty({ ...option?.apiPropertyOptions, enum: Object.values(values) }),
  );
}

export const IsValidEnumOptionalApi = <T extends Object>(values: T, option?: Option,) => {
  return applyDecorators(IsValidEnumApi<T>(values, { apiPropertyOptions: { ...option?.apiPropertyOptions, required: false } as ApiPropertyOptions, validationOptions: option?.validationOptions }), IsOptional());
}
