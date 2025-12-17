import { Module } from '@nestjs/common';
import { UserLocalAuthSessionRepository } from './user.local.auth.session.repository';

@Module({
  providers: [UserLocalAuthSessionRepository],
  exports: [UserLocalAuthSessionRepository],
})
export class UserLocalAuthSessionRepositoryModule {}
