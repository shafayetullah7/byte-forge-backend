// src/common/exception-filters/all-exceptions.filter.ts
import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { ZodError } from 'zod';
import { DrizzleError } from 'drizzle-orm';
import { Response } from 'express';
import { ResponseService } from '../modules/response/response.service';
import { CustomException } from '../exceptions/custom.exception';
import { ErrorCode } from '../modules/response/dto/error.schema';
import { ResponseValidationError } from '../modules/response/dto/response.validation.error.schema';
import { ValidationError } from 'class-validator';
import { AppEnvService } from '../../_config/app-env/app-env.service';
import { ZodValidationException } from 'nestjs-zod';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(
    private readonly responseService: ResponseService,
    private readonly appEnvService: AppEnvService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const contextType = host.getType<'graphql' | 'http' | 'ws' | 'rpc'>();

    if (contextType === 'http') {
      return this.handleHttpException(exception, host);
    }

    if (contextType === 'graphql') {
      return this.handleGraphQLException(exception, host);
    }

    // fallback
    return this.handleHttpException(exception, host);
  }

  private handleHttpException(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errorResponse = this.handleException(exception);

    return response
      .status(
        this.getHttpStatus(
          errorResponse.error.code || ErrorCode.INTERNAL_SERVER_ERROR,
        ),
      )
      .json(errorResponse);
  }

  private handleGraphQLException(exception: unknown, host: ArgumentsHost) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const gqlHost = GqlArgumentsHost.create(host);

    const errorResponse = this.handleException(exception);

    throw new GraphQLError(errorResponse.message, {
      extensions: errorResponse,
    });
  }

  private handleException(exception: unknown) {
    // 1. Zod Validation Errors
    if (exception instanceof ZodValidationException) {
      const validationErrors = this.formatZodErrors(exception);
      return this.responseService.error({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Please review the provided data',
        details: 'Check the validationErrors array for details',
        validationErrors,
      });
    }

    // 2. NestJS BadRequestException (often from ClassValidator)
    if (exception instanceof BadRequestException) {
      return this.handleBadRequestException(exception);
    }

    // 3. Drizzle Database Errors
    if (exception instanceof DrizzleError || (exception as any).code) {
      const error = exception as any;
      const pgCode = error.code || (error.originalError as any)?.code;

      this.logger.error(
        `Database Error [${pgCode || 'unknown'}]: ${error.message}`,
        error.stack,
      );

      // Map unique_violation (23505) to CONFLICT
      if (pgCode === '23505') {
        return this.responseService.error({
          code: ErrorCode.CONFLICT,
          message: 'Entry already exists',
          details: this.isProduction()
            ? 'A record with this information already exists'
            : error.detail || error.message,
        });
      }

      return this.responseService.error({
        code: ErrorCode.DATABASE_ERROR,
        message: 'Database error occurred',
        details: this.isProduction() ? 'Internal server error' : error.message,
        validationErrors: [],
      });
    }

    // 4. Custom Exceptions
    if (exception instanceof CustomException) {
      return this.responseService.error({
        code: exception.errorCode,
        message: exception.message,
        details: exception.details || exception.message || 'Unknown error',
      });
    }

    // 5. NestJS HTTP Exceptions
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      return this.responseService.error({
        code: this.getErrorCode(exception, status),
        message: this.getErrorMessage(exception, status),
        details: exception.message,
      });
    }

    // 6. Unknown / Internal Server Error
    this.logger.error(
      `Unexpected Error: ${(exception as Error).message}`,
      (exception as Error).stack,
    );
    return this.responseService.error({
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      details: this.isProduction()
        ? 'An unexpected error occurred'
        : (exception as Error).message,
    });
  }

  private handleBadRequestException(exception: BadRequestException) {
    const res = exception.getResponse();
    let validationErrors: ResponseValidationError[] = [];

    console.log(res);

    if (res instanceof ZodValidationException) {
      validationErrors = this.formatZodErrors(res);
      return this.responseService.error({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Validation failed',
        details: 'Check validationErrors array for details',
        validationErrors,
      });
    }

    if (Array.isArray(res)) {
      validationErrors = (res as ValidationError[]).map((err) => ({
        field: err.property,
        message: err.constraints
          ? Object.values(err.constraints).join(', ')
          : 'Unknown validation error',
      }));
    } else if (
      typeof res === 'object' &&
      res !== null &&
      'message' in res &&
      Array.isArray((res as { message: string }).message)
    ) {
      validationErrors = (res as { message: string[] }).message.map((msg) => ({
        field: 'unknown_field',
        message: msg,
      }));
    }

    return this.responseService.error({
      code: ErrorCode.VALIDATION_ERROR,
      message: exception.message,
      details: 'Check validationErrors array for details',
      validationErrors,
    });
  }

  private isProduction(): boolean {
    return this.appEnvService.NODE_ENV === 'production';
  }

  private getHttpStatus(code: ErrorCode): number {
    switch (code) {
      case ErrorCode.BAD_REQUEST:
      case ErrorCode.VALIDATION_ERROR:
        return HttpStatus.BAD_REQUEST;
      case ErrorCode.UNAUTHORIZED:
        return HttpStatus.UNAUTHORIZED;
      case ErrorCode.FORBIDDEN:
        return HttpStatus.FORBIDDEN;
      case ErrorCode.NOT_FOUND:
        return HttpStatus.NOT_FOUND;
      case ErrorCode.CONFLICT:
        return HttpStatus.CONFLICT;
      case ErrorCode.TOO_MANY_REQUESTS:
        return HttpStatus.TOO_MANY_REQUESTS;
      case ErrorCode.METHOD_NOT_ALLOWED:
        return HttpStatus.METHOD_NOT_ALLOWED;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
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

  private formatZodErrors(
    zodError: ZodValidationException,
  ): ResponseValidationError[] {
    const error = zodError.getZodError() as ZodError;
    // console.log('zodError', zodError);
    return error.issues.map((issue) => {
      return {
        field: issue.path.join('.') || 'unknown_field',
        message: issue.message,
        code: issue.code,
      };
    });
  }
}
