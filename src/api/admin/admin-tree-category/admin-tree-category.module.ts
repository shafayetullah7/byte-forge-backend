import { Module } from '@nestjs/common';
import { AdminTreeCategoryController } from './admin-tree-category.controller';
import { AdminTreeCategoryService } from './admin-tree-category.service';
import { AdminSessionModule } from '../admin-session/admin-session.module';
import { SessionRepositoryModule } from '@/_repositories/auth/session.repository/session.repository.module';
import { TreeCategoryRepositoryModule } from '@/_repositories/library/tree.category.repository/tree.category.repository.module';
import { AdminAuthGuardModule } from '@/common/guards/admin-auth-guard/admin-auth-guard.module';

@Module({
  imports: [
    AdminSessionModule,
    SessionRepositoryModule,
    TreeCategoryRepositoryModule,
    AdminAuthGuardModule,
  ],
  controllers: [AdminTreeCategoryController],
  providers: [AdminTreeCategoryService],
})
export class AdminTreeCategoryModule {}
