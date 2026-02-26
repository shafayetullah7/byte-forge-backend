import { Module } from '@nestjs/common';
import { TagGroupRepositoryModule } from '../../../../_repositories/library/taxonomy/tag-group.repository.module';
import { TagRepositoryModule } from '../../../../_repositories/library/taxonomy/tag.repository.module';
import { AdminTagGroupsController } from './admin-tag-groups.controller';
import { AdminTagGroupsService } from './admin-tag-groups.service';
import { AdminTagGroupTranslationsModule } from './tag-group-translations/admin-tag-group-translations.module';

@Module({
  imports: [TagGroupRepositoryModule, TagRepositoryModule, AdminTagGroupTranslationsModule],
  controllers: [AdminTagGroupsController],
  providers: [AdminTagGroupsService],
  exports: [AdminTagGroupsService],
})
export class AdminTagGroupsModule {}
