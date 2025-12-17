import { Module } from '@nestjs/common';
import { BusinessAccountService } from './business-account.service';
import { BusinessAccountController } from './business-account.controller';
import { MediaModule } from '@/api/media/media.module';
import { BusinessAccountRepositoryModule } from '@/_repositories/business/business.account.repository/business.account.repository.module';

@Module({
  controllers: [BusinessAccountController],
  providers: [BusinessAccountService],
  imports: [MediaModule, BusinessAccountRepositoryModule],
})
export class BusinessAccountModule {}
