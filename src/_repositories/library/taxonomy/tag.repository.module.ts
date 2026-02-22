import { Module } from '@nestjs/common';
import { TagRepository } from './tag.repository';
import { DbModule } from 'src/_db/db.module';

@Module({
  imports: [DbModule],
  providers: [TagRepository],
  exports: [TagRepository],
})
export class TagRepositoryModule {}
