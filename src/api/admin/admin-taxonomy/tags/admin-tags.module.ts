import { Module } from '@nestjs/common';
import { TagRepositoryModule } from '../../../../_repositories/library/taxonomy/tag.repository.module';
import { TagGroupRepositoryModule } from '../../../../_repositories/library/taxonomy/tag-group.repository.module';
import { AdminTagsController } from './admin-tags.controller';
import { AdminTagsService } from './admin-tags.service';


@Module({
  imports: [TagRepositoryModule, TagGroupRepositoryModule],
  controllers: [AdminTagsController],
  providers: [AdminTagsService],
  exports: [AdminTagsService],
})
export class AdminTagsModule {}
