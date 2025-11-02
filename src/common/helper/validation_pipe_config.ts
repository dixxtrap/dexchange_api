import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { badRequestExceptionCatch } from './bad_request_error';




export const validationConfig = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: false,
  transformOptions: { strategy: 'exposeAll' },
  transform: true,
  exceptionFactory: badRequestExceptionCatch,
});
