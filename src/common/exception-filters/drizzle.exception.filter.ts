import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DrizzleError } from 'drizzle-orm';
import { ResponseService } from '../modules/response/response.service';
import { ErrorCode } from '../modules/response/dto/error.schema';

@Catch(DrizzleError)
export class DrizzleExceptionFilter implements ExceptionFilter {
  private readonly sensitiveFields = ['password', 'token', 'credit_card'];

  constructor(private readonly responseService: ResponseService) {}

  catch(exception: DrizzleError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { message, name, cause, stack } = exception;

    const errorResponse = this.responseService.error({
      code: ErrorCode.DATABASE_ERROR,
      message: 'Something went wrong',
      details: message,
      validationErrors: [],
    });

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(errorResponse);
  }
}
