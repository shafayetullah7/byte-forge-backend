import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UserAuthGuard } from '../user-auth-guard/user-auth.guard';
import { EmailVerifiedGuard } from '../email-verified-guard/email-verified.guard';

@Injectable()
export class VerifiedUserAuthGuard implements CanActivate {
  constructor(
    private readonly userAuthGuard: UserAuthGuard,
    private readonly emailVerifiedGuard: EmailVerifiedGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First check authentication
    const isAuthenticated = await this.userAuthGuard.canActivate(context);
    if (!isAuthenticated) {
      return false;
    }

    // Then check email verification
    return this.emailVerifiedGuard.canActivate(context);
  }
}
