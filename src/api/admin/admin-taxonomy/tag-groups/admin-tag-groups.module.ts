import { Module } from '@nestjs/common';
import { TagGroupRepositoryModule } from '../../../../_repositories/library/taxonomy/tag-group.repository.module';
import { TagRepositoryModule } from '../../../../_repositories/library/taxonomy/tag.repository.module';
import { AdminTagGroupsController } from './admin-tag-groups.controller';
import { AdminTagGroupTranslationsService } from './services/admin-tag-group-translations.service';
import { AdminTagGroupsService } from './services/admin-tag-groups.service';
import { AdminTagsModule } from '../tags/admin-tags.module';

@Module({
  imports: [TagGroupRepositoryModule, TagRepositoryModule, AdminTagsModule],
  controllers: [AdminTagGroupsController],
  providers: [
    AdminTagGroupsService, 
    AdminTagGroupTranslationsService
  ],
  exports: [
    AdminTagGroupsService, 
    AdminTagGroupTranslationsService
  ],
})
export class AdminTagGroupsModule {}
