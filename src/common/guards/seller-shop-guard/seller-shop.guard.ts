import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { AccessUserAuth } from '@/common/types';

@Injectable()
export class SellerShopGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const auth = request.user as AccessUserAuth | undefined;

    if (!auth?.shop) {
      throw new ForbiddenException('No active shop found for this seller');
    }

    return true;
  }
}
