import { Module } from '@nestjs/common';
import { AdminLocalAuthGuard } from './admin-local-auth.guard';

@Module({
  providers: [AdminLocalAuthGuard],
  exports: [AdminLocalAuthGuard],
})
export class AdminLocalAuthGuardModule {}
