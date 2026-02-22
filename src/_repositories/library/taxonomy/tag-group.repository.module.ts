import { Module } from '@nestjs/common';
import { TagGroupRepository } from './tag-group.repository';

@Module({
  imports: [],
  providers: [TagGroupRepository],
  exports: [TagGroupRepository],
})
export class TagGroupRepositoryModule {}
