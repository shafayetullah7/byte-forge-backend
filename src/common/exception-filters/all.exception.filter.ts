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

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly responseService: ResponseService) {}

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

    // console.log({ contextType });

    // Try to detect GraphQL
    // try {
    //   GqlArgumentsHost.create(host); // Will succeed only in GraphQL context
    //   return this.handleGraphQLException(exception, host);
    // } catch {
    //   // Fallback to HTTP handling for other contexts (ws, rpc, etc.)
    //   return this.handleHttpException(exception, host);
    // }
  }

  private handleHttpException(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Handle Zod validation errors
    if (exception instanceof ZodError) {
      const validationErrors = this.formatZodErrors(exception);

      const errorResponse = this.responseService.error({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Please review the provided data',
        details: 'Check the validationErrors array for details',
        validationErrors,
      });

      return response.status(HttpStatus.BAD_REQUEST).json(errorResponse);
    }

    if (exception instanceof BadRequestException) {
      const res = exception.getResponse();

      let validationErrors: ResponseValidationError[] = [];

      if (Array.isArray(res)) {
        // Type res as ValidationError[]
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
        validationErrors = (res as { message: string[] }).message.map(
          (msg) => ({
            field: 'unknown_field',
            message: msg,
          }),
        );
      }

      return response.status(HttpStatus.BAD_REQUEST).json(
        this.responseService.error({
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Validation failed',
          details: 'Check validationErrors array for details',
          validationErrors,
        }),
      );
    }

    // Handle Drizzle database errors
    if (exception instanceof DrizzleError) {
      const errorResponse = this.responseService.error({
        code: ErrorCode.DATABASE_ERROR,
        message: 'Something went wrong',
        details: exception.message,
        validationErrors: [],
      });

      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(errorResponse);
    }

    // Handle custom exceptions
    if (exception instanceof CustomException) {
      const { statusCode, message, errorCode, details } = exception;
      return response.status(statusCode).json(
        this.responseService.error({
          code: errorCode,
          message,
          details: details || message || 'Unknown error',
        }),
      );
    }

    // Handle NestJS HTTP exceptions
    if (exception instanceof HttpException) {
      const status = exception.getStatus();

      return response.status(status).json(
        this.responseService.error({
          code: this.getErrorCode(exception, status),
          message: this.getErrorMessage(exception, status),
          details: exception.message,
        }),
      );
    }

    // Fallback for unhandled errors
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      this.responseService.error({
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      }),
    );
  }

  private handleGraphQLException(exception: unknown, host: ArgumentsHost) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const gqlHost = GqlArgumentsHost.create(host);

    // Handle Zod validation errors in GraphQL context
    if (exception instanceof ZodError) {
      const validationErrors = this.formatZodErrors(exception);

      const payload = this.responseService.error({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Please review the provided data',
        details: 'Check the validationErrors array for details',
        validationErrors,
      });

      throw new GraphQLError(payload.message, { extensions: payload });
    }

    if (exception instanceof BadRequestException) {
      const res = exception.getResponse();
      let validationErrors: ResponseValidationError[] = [];

      if (typeof res === 'object') {
        console.log((res as { message: string }).message);
        if (Array.isArray(res)) {
          validationErrors = res.map(
            (err: {
              property: string;
              constraints: Record<string, string>;
            }) => {
              console.log({ err });
              return {
                field: err.property,
                message: Object.values(err.constraints || {}).join(', '),
              };
            },
          );
        }
      }

      const payload = this.responseService.error({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Validation failed',
        details: 'Check validationErrors array for details',
        validationErrors,
      });

      throw new GraphQLError(payload.message, { extensions: payload });
    }

    // Handle Drizzle database errors in GraphQL context
    if (exception instanceof DrizzleError) {
      const payload = this.responseService.error({
        code: ErrorCode.DATABASE_ERROR,
        message: 'Something went wrong',
        details: exception.message,
        validationErrors: [],
      });

      throw new GraphQLError(payload.message, { extensions: payload });
    }

    // Handle custom exceptions in GraphQL context
    if (exception instanceof CustomException) {
      const payload = this.responseService.error({
        code: exception.errorCode,
        message: exception.message,
        details: exception.details,
      });
      throw new GraphQLError(payload.message, { extensions: payload });
    }

    // Handle NestJS HttpException in GraphQL context
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = this.responseService.error({
        code: status as unknown as ErrorCode,
        message: exception.message,
      });
      throw new GraphQLError(payload.message, { extensions: payload });
    }

    // Fallback for GraphQL
    const payload = this.responseService.error({
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
    throw new GraphQLError(payload.message, { extensions: payload });
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

  private formatZodErrors(zodError: ZodError): ResponseValidationError[] {
    return zodError.errors.map((error) => {
      return {
        field: error.path.join('.') || 'unknown_field',
        message: error.message,
      };
    });
  }
}
