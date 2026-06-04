import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { CalculatePriceBreakdownService } from './services/calculate-price-breakdown.service';
import { PlaceOrderService } from './services/place-order.service';
import { CartRepositoryModule } from '@/_repositories/user/cart.repository/cart.repository.module';
import { UserAddressRepositoryModule } from '@/_repositories/user/user-address.repository/user-address.repository.module';
import { OrderRepositoryModule } from '@/_repositories/user/order.repository/order.repository.module';
import { CartAccessGuardModule } from '@/common/guards/cart-access-guard/cart-access-guard.module';

@Module({
  controllers: [CheckoutController],
  providers: [CalculatePriceBreakdownService, PlaceOrderService],
  imports: [CartRepositoryModule, UserAddressRepositoryModule, OrderRepositoryModule, CartAccessGuardModule],
})
export class CheckoutModule {}
