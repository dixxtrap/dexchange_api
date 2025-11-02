import { Request, Response } from 'express';


import { ArgumentsHost } from '@nestjs/common/interfaces/features/arguments-host.interface';
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';
import { ExceptionFilter } from '@nestjs/common/interfaces/exceptions/exception-filter.interface';
import { Catch } from '@nestjs/common/decorators/core/catch.decorator';
import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';
import { HttpExceptionCode, WsMessage } from './ws_message';
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    console.log('--------------exception catcher -------------');

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let status = exception?.getStatus ? exception?.getStatus() : 500;
    let code: string = 'INERTNAL_SERVER_ERROR';
    console.log(exception);
    console.log('=================filter exception=============');
    if (exception instanceof UnauthorizedException) {
      code = 'UNAUTHORIZED';
      response.status(status).json({
        code: code,
        message: HttpExceptionCode.LOGIN_FAILLURE.message,
        status: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    } else if (exception instanceof BadRequestException) {
      const message = (exception.getResponse() as unknown as { message: string[] })
        .message;
      code = 'BAD_REQUEST';

      console.log("================BAD_REQUEST+++++++++++++++", exception.getResponse(), message);

      response.status(status).json({
        code: code,
        message,
        status: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      return;
    } else if (exception instanceof WsMessage) {
      console.log("================WS_MESSAGE++++++++++++++++")
      const e = exception.getResponse() as Object;
      response.status(status).json({
        ...e,
        status: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      return;
    } else if (exception instanceof PrismaClientValidationError) {
      const err = exception as PrismaClientValidationError;
      console.log(err.name);
      status = 404;
      code = 'NOT_FOUND';
      const message = [err.name + ':' + err.message.split('\n').pop()];
      response.status(status).json({
        code: code,
        message: [message],
        status: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      return;
    } else if (
      exception instanceof PrismaClientKnownRequestError ||
      exception.meta
    ) {
      console.log(exception);
      console.timeLog('===============Know prisma request=============');
      let message = "";
      if (exception satisfies PrismaClientKnownRequestError) {
        const exp = exception as PrismaClientKnownRequestError;

        console.log('=================PrismaClientKnownRequestError=================');
        console.log(exp.code);
        if (exception instanceof PrismaClientKnownRequestError) {
          console.log('=================PrismaClientKnownRequestError=================');
          console.log(exception.code, '=================');

          if (exp.code === 'P2002') {
            code = 'UNIQUE_CONSTRAINT_VIOLATION';
            message =
              exp.meta?.modelName +
              ' ' +
              (exp.meta?.target ?? exp.meta?.cause) + " " + request.body[`${exp.meta!.target ?? exp!.meta!.cause}`] + " Already exists";

          }
          else if (exp.code === 'P2025') {
            status = 404;
            code = 'NOT_FOUND';
            message =
              exp.meta?.modelName +
              ' ' +
              (exp.meta?.target ?? exp.meta?.cause);

          }
        }
        else {
          console.log(exception);
          status = 500;
          code = 'CONSTRAINT_VIOLATION';
          message =
            exp.meta?.modelName +
            ' : ' +
            (exp.meta?.target ?? exp.meta?.cause) + "::" + exp.code;
        }
      }


      response.status(status).json({
        code: code,
        message: [message],
        status: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      return;
    } else {
      response.status(status).json({
        status: status,
        message: HttpExceptionCode.FAILLURE.message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
