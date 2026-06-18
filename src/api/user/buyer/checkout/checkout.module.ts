import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { CalculatePriceBreakdownService } from './services/calculate-price-breakdown.service';
import { PlaceOrderService } from './services/place-order.service';
import { CheckoutPaymentMethodService } from './services/checkout-payment-method.service';
import { CartRepositoryModule } from '@/_repositories/user/cart.repository/cart.repository.module';
import { UserAddressRepositoryModule } from '@/_repositories/user/user-address.repository/user-address.repository.module';
import { OrderRepositoryModule } from '@/_repositories/user/order.repository/order.repository.module';
import { PaymentMethodRepositoryModule } from '@/_repositories/payment/payment-method.repository/payment-method.repository.module';
import { OrderServicesModule } from '@/common/services/order/order-services.module';
import { CartAccessGuardModule } from '@/common/guards/cart-access-guard/cart-access-guard.module';

@Module({
  controllers: [CheckoutController],
  providers: [
    CalculatePriceBreakdownService,
    PlaceOrderService,
    CheckoutPaymentMethodService,
  ],
  imports: [
    CartRepositoryModule,
    UserAddressRepositoryModule,
    OrderRepositoryModule,
    PaymentMethodRepositoryModule,
    OrderServicesModule,
    CartAccessGuardModule,
  ],
})
export class CheckoutModule {}
