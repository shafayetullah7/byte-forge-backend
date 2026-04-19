import { Module } from '@nestjs/common';
import { ShopVerificationHistoryRepository } from './shop.verification.history.repository';
import { DrizzleModule } from '@/_db/drizzle/drizzle.module';

@Module({
  providers: [ShopVerificationHistoryRepository],
  exports: [ShopVerificationHistoryRepository],
  imports: [DrizzleModule],
})
export class ShopVerificationHistoryModule {}
