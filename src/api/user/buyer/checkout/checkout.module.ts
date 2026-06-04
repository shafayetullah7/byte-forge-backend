import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { CalculatePriceBreakdownService } from './services/calculate-price-breakdown.service';
import { CartRepositoryModule } from '@/_repositories/user/cart.repository/cart.repository.module';
import { CartAccessGuardModule } from '@/common/guards/cart-access-guard/cart-access-guard.module';

@Module({
  controllers: [CheckoutController],
  providers: [CalculatePriceBreakdownService],
  imports: [CartRepositoryModule, CartAccessGuardModule],
  exports: [CalculatePriceBreakdownService],
})
export class CheckoutModule {}
