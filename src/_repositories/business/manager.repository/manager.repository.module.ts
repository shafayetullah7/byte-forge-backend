import { Module } from '@nestjs/common';
import { ManagerRepository } from './manager.repository';

@Module({
  providers: [ManagerRepository],
  exports: [ManagerRepository],
})
export class ManagerRepositoryModule {}
