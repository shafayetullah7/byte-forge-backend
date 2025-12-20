import { Global, Module } from '@nestjs/common';
import { AdminAuthGuard } from './admin-auth.guard';
import { AdminSessionModule } from '@/api/admin/admin-session/admin-session.module';
import { SessionRepositoryModule } from '@/_repositories/auth/session.repository/session.repository.module';

@Global()
@Module({
  imports: [AdminSessionModule, SessionRepositoryModule],
  providers: [AdminAuthGuard],
  exports: [AdminAuthGuard, SessionRepositoryModule],
})
export class AdminAuthGuardModule {}
