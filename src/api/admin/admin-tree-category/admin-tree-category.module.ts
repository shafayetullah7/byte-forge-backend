import { Module } from '@nestjs/common';
import { AdminTreeCategoryController } from './admin-tree-category.controller';
import { AdminTreeCategoryService } from './admin-tree-category.service';
import { AdminSessionModule } from '../admin-session/admin-session.module';
import { SessionModule } from '@/api/session/session.module';
import { TreeCategoryRepositoryModule } from '@/_repositories/library/tree.category.repository/tree.category.repository.module';
import { AdminAuthGuardModule } from '@/common/guards/admin-auth-guard/admin-auth-guard.module';

@Module({
  imports: [
    AdminSessionModule,
    SessionModule,
    TreeCategoryRepositoryModule,
    AdminAuthGuardModule,
  ],
  controllers: [AdminTreeCategoryController],
  providers: [AdminTreeCategoryService],
})
export class AdminTreeCategoryModule {}
