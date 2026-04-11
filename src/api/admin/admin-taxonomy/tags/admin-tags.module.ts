import { Module } from '@nestjs/common';
import { TagRepositoryModule } from '../../../../_repositories/library/taxonomy/tag.repository.module';
import { TagGroupRepositoryModule } from '../../../../_repositories/library/taxonomy/tag-group.repository.module';

import { AdminTagsController } from './admin-tags.controller';
import { AdminTagsService } from './services/admin-tags.service';
import { AdminTagTranslationsService } from './services/admin-tag-translations.service';

@Module({
  imports: [TagRepositoryModule, TagGroupRepositoryModule],
  controllers: [AdminTagsController],
  providers: [AdminTagsService, AdminTagTranslationsService],
  exports: [AdminTagsService, AdminTagTranslationsService],
})
export class AdminTagsModule {}
