import { Module } from '@nestjs/common';
import { AdminLocalAuthRepository } from './admin.local.auth.repository';

@Module({
  providers: [AdminLocalAuthRepository],
  exports: [AdminLocalAuthRepository],
})
export class AdminLocalAuthRepositoryModule {}
