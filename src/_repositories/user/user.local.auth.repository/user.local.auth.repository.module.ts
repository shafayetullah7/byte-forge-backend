import { Module } from '@nestjs/common';
import { UserLocalAuthRepository } from './user.local.auth.repository';

@Module({
  providers: [UserLocalAuthRepository],
  exports: [UserLocalAuthRepository],
})
export class UserLocalAuthRepositoryModule {}
