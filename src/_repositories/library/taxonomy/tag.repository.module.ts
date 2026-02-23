import { Module } from '@nestjs/common';
import { TagRepository } from './tag.repository';

@Module({
  imports: [],
  providers: [TagRepository],
  exports: [TagRepository],
})
export class TagRepositoryModule {}
