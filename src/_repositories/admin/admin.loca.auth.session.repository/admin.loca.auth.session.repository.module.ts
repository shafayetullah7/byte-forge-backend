import { Module } from '@nestjs/common';
import { AdminLocalAuthSessionRepository } from './admin.loca.auth.session.repository';

@Module({
  providers: [AdminLocalAuthSessionRepository],
  exports: [AdminLocalAuthSessionRepository],
})
export class AdminLocalAuthSessionRepositoryModule {}
