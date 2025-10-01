// src/common/exception-filters/gql-exception.filter.ts
import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { ResponseService } from '../modules/response/response.service';
import { CustomException } from '../exceptions/custom.exception';
import { ErrorCode } from '../modules/response/dto/error.schema';

@Catch()
export class GqlExceptionFilter implements ExceptionFilter {
  constructor(private readonly responseService: ResponseService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const gqlHost = GqlArgumentsHost.create(host);

    // Custom exception
    if (exception instanceof CustomException) {
      const payload = this.responseService.error({
        code: exception.errorCode,
        message: exception.message,
        details: exception.details,
      });
      throw new GraphQLError(payload.message, { extensions: payload });
    }

    // NestJS HttpException
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = this.responseService.error({
        code: status as unknown as ErrorCode, // reuse status as code if no mapping
        message: exception.message,
      });
      throw new GraphQLError(payload.message, { extensions: payload });
    }

    // Fallback
    const payload = this.responseService.error({
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
    throw new GraphQLError(payload.message, { extensions: payload });
  }
}
