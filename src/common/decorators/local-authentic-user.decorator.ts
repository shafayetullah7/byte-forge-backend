import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { TLocalAuthenticUser, AuthAccess } from '../types';

export const LocalAuthenticUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TLocalAuthenticUser => {
    const req = ctx.switchToHttp().getRequest<Request>();

    const auth = req.user as AuthAccess;
    if (!auth || auth.role !== 'user') {
      throw new UnauthorizedException('Unauthorized access');
    }

    if (!auth.userLocalAuth) {
      throw new UnauthorizedException('Unauthorized access');
    }

    const { user, userLocalAuth } = auth;
    return { user, userLocalAuth };
  },
);
