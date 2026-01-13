import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthAccess } from '@/common/types';
import { CustomException } from '@/common/exceptions/custom.exception';
import { ErrorCode } from '@/common/modules/response/dto/error.schema';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const auth = request.user as AuthAccess;

    if (!auth || auth.role !== 'user') {
      return true; // Let other guards handle auth
    }

    if (!auth.user.emailVerified) {
      throw new CustomException({
        message: 'Email verification required',
        statusCode: HttpStatus.FORBIDDEN,
        errorCode: ErrorCode.EMAIL_NOT_VERIFIED,
      });
    }

    return true;
  }
}
