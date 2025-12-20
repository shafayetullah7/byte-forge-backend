import { Module } from '@nestjs/common';
import { UserLocalAuthSessionRepositoryService } from './user-local-auth-session-repository.service';

@Module({
  controllers: [],
  providers: [UserLocalAuthSessionRepositoryService],
  exports: [UserLocalAuthSessionRepositoryService],
})
export class UserLocalAuthSessionRepositoryModule {}
