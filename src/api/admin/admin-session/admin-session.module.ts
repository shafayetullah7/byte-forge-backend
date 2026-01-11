import { Module } from '@nestjs/common';
import { AdminSessionService } from './admin-session.service';
import { AdminSessionController } from './admin-session.controller';
import { SessionRepositoryModule } from '@/_repositories/auth/session.repository/session.repository.module';

@Module({
  imports: [SessionRepositoryModule],
  controllers: [AdminSessionController],
  providers: [AdminSessionService],
  exports: [AdminSessionService],
})
export class AdminSessionModule {}
