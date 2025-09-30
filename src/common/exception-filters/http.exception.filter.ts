import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Response } from 'express';
import { CustomException } from '../exceptions/custom.exception';
import { ResponseService } from '../modules/response/response.service';
import { ErrorCode } from '../modules/response/dto/error.schema';
import { GraphQLError } from 'graphql';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly responseService: ResponseService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    // Determine if context is GraphQL or HTTP
    const isGraphQL = host.getType<'graphql'>() === 'graphql';

    // Generate a standardized error payload
    const errorPayload = this.buildErrorPayload(exception);

    if (isGraphQL) {
      // GraphQL: throw a GraphQLError with custom extensions
      throw new GraphQLError(errorPayload.message, {
        extensions: errorPayload,
      });
    }

    // HTTP: send JSON response
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = (errorPayload.error.code ||
      HttpStatus.INTERNAL_SERVER_ERROR) as number;

    return response.status(status).json(errorPayload);
  }

  private buildErrorPayload(exception: unknown) {
    // Handle CustomException
    if (exception instanceof CustomException) {
      const { message, errorCode, details } = exception;
      return this.responseService.error({
        code: errorCode,
        message,
        details: details || message || 'Unknown error',
      });
    }

    // Handle NestJS HttpExceptions
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message = this.getErrorMessage(exception, status);
      return this.responseService.error({
        code: this.getErrorCode(exception, status),
        message,
        details: exception.message,
      });
    }

    // Fallback for unknown exceptions
    return this.responseService.error({
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message:
        exception instanceof Error
          ? exception.message
          : 'Internal server error',
    });
  }

  private getErrorCode(
    exception: HttpException,
    status: HttpStatus,
  ): ErrorCode {
    if (exception instanceof BadRequestException)
      return ErrorCode.VALIDATION_ERROR;
    if (exception instanceof UnauthorizedException)
      return ErrorCode.UNAUTHORIZED;
    if (exception instanceof ForbiddenException) return ErrorCode.FORBIDDEN;
    if (exception instanceof NotFoundException) return ErrorCode.NOT_FOUND;
    if (exception instanceof ConflictException) return ErrorCode.CONFLICT;

    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.BAD_REQUEST;
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ErrorCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ErrorCode.NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ErrorCode.CONFLICT;
      case HttpStatus.TOO_MANY_REQUESTS:
        return ErrorCode.TOO_MANY_REQUESTS;
      case HttpStatus.METHOD_NOT_ALLOWED:
        return ErrorCode.METHOD_NOT_ALLOWED;
      default:
        return ErrorCode.INTERNAL_SERVER_ERROR;
    }
  }

  private getErrorMessage(
    exception: HttpException,
    status: HttpStatus,
  ): string {
    if (exception.message) return exception.message;

    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad request';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND:
        return 'Not found';
      case HttpStatus.CONFLICT:
        return 'Conflict';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'Too many requests';
      case HttpStatus.METHOD_NOT_ALLOWED:
        return 'Method not allowed';
      default:
        return 'Internal server error';
    }
  }
}
