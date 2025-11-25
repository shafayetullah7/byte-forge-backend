import { Module } from '@nestjs/common';
import { BusinessAccountService } from './business-account.service';
import { BusinessAccountController } from './business-account.controller';
import { MediaModule } from '@/api/media/media.module';

@Module({
  controllers: [BusinessAccountController],
  providers: [BusinessAccountService],
  imports: [MediaModule],
})
export class BusinessAccountModule {}
