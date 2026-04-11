import { Global, Module } from '@nestjs/common';
import { AdminAuthGuard } from './admin-auth.guard';
import { AdminSessionModule } from '@/api/admin/admin-session/admin-session.module';
import { SessionRepositoryModule } from '@/_repositories/auth/session.repository/session.repository.module';
import { AdminAuthModule } from '@/api/admin/admin-auth/admin-auth.module';

@Global()
@Module({
  imports: [AdminSessionModule, SessionRepositoryModule, AdminAuthModule],
  providers: [AdminAuthGuard],
  exports: [
    AdminAuthGuard,
    SessionRepositoryModule,
    AdminAuthModule,
    AdminSessionModule,
  ],
})
export class AdminAuthGuardModule {}
