import { Module } from '@nestjs/common';
import { UserLocalAuthGuard } from './user-local-auth.guard';

@Module({
  providers: [UserLocalAuthGuard],
  exports: [UserLocalAuthGuard],
})
export class UserLocalAuthGuardModule {}
