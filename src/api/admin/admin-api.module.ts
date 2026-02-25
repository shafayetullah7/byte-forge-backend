import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { AdminAuthModule } from './admin-auth/admin-auth.module';
import { AdminSessionModule } from './admin-session/admin-session.module';
import { AdminTagGroupsModule } from './admin-taxonomy/tag-groups/admin-tag-groups.module';
import { AdminTagsModule } from './admin-taxonomy/tags/admin-tags.module';
import { AdminCategoriesModule } from './admin-taxonomy/categories/admin-categories.module';
@Module({
  imports: [
    AdminModule,
    AdminAuthModule,
    AdminSessionModule,
    AdminTagGroupsModule,
    AdminTagsModule,
    AdminCategoriesModule,
  ],
  exports: [
    AdminModule,
    AdminAuthModule,
    AdminSessionModule,
    AdminTagGroupsModule,
    AdminTagsModule,
    AdminCategoriesModule,
  ],
})
export class AdminApiModule {}
