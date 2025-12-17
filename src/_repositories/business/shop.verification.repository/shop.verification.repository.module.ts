import { Module } from '@nestjs/common';
import { ShopVerificationRepository } from './shop.verification.repository';

@Module({
  providers: [ShopVerificationRepository],
  exports: [ShopVerificationRepository],
})
export class ShopVerificationRepositoryModule {}
