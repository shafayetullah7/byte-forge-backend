import { Module } from '@nestjs/common';
import { EmailVerifiedGuard } from './email-verified.guard';

@Module({
  providers: [EmailVerifiedGuard],
  exports: [EmailVerifiedGuard],
})
export class EmailVerifiedGuardModule {}
