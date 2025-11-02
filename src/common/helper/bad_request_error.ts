import { ValidationError } from '@nestjs/common/interfaces/external/validation-error.interface';
import { WsMessage } from './ws_message';

export const badRequestExceptionCatch = (errors: ValidationError[]) => {
  console.log(errors)
  const messages: Array<string> = [];
  errors.forEach((error) =>
    Object.entries(error.constraints!).forEach((value) => {
      console.log("===================bad request first validator====================");
      console.log(value);

      console.log(error)
      messages.push(`${error?.property!} : ${value[1]} ${value[0]}`.toString());
    }),
  );

  throw new WsMessage({
    message: messages,
    code: 'BAD_REQUEST',
    status: 404,
  });
};
