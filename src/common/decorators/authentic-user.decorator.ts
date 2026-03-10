import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AccessUserAuth, TAuthenticUser } from '../types';

export const AuthenticUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TAuthenticUser => {
    const req = ctx.switchToHttp().getRequest<Request>();

    const auth = req.user as AccessUserAuth | undefined;
    if (!auth) {
      throw new UnauthorizedException('Unauthorized access');
    }

    if (!auth.session) {
      throw new UnauthorizedException('Unauthorized access');
    }

    const { user, session } = auth;
    return { user, session };
  },
);
