import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { AdminAuthModule } from './admin-auth/admin-auth.module';
import { AdminSessionModule } from './admin-session/admin-session.module';
import { AdminTreeCategoryModule } from './admin-tree-category/admin-tree-category.module';

@Module({
  imports: [
    AdminModule,
    AdminAuthModule,
    AdminSessionModule,
    AdminTreeCategoryModule,
  ],
  exports: [
    AdminModule,
    AdminAuthModule,
    AdminSessionModule,
    AdminTreeCategoryModule,
  ],
})
export class AdminApiModule {}
