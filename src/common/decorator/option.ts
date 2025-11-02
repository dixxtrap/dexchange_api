import { ApiPropertyOptions } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { ValidationOptions } from 'class-validator/types/decorator/ValidationOptions';

export type ValidationOption = {
  apiPropertyOptions?: ApiPropertyOptions;
  validationOptions?: ValidationOptions;
};
export const getOptionalOption = (option?: ValidationOption) => {
  if (!option) option = { apiPropertyOptions: { required: false } };
  else if (!option.apiPropertyOptions)
    option.apiPropertyOptions = { required: false };
  else option.apiPropertyOptions.required = false;
  return option;
};
