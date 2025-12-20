import { Module } from '@nestjs/common';
import { UserSessionRepository } from './user-session-repository.service';

@Module({
  controllers: [],
  providers: [UserSessionRepository],
  exports: [UserSessionRepository],
})
export class UserSessionRepositoryModule {}
