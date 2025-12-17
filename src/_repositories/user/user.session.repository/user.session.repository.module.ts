import { Module } from '@nestjs/common';
import { UserSessionRepository } from './user.session.repository';

@Module({
  providers: [UserSessionRepository],
  exports: [UserSessionRepository],
})
export class UserSessionRepositoryModule {}
