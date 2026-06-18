import { Module } from '@nestjs/common';
import { CartModule } from './cart/cart.module';
import { AddressesModule } from './addresses/addresses.module';
import { CheckoutModule } from './checkout/checkout.module';
import { OrdersModule } from './orders/orders.module';
import { BuyerReviewsModule } from './reviews/buyer-reviews.module';

@Module({
  imports: [
    CartModule,
    AddressesModule,
    CheckoutModule,
    OrdersModule,
    BuyerReviewsModule,
  ],
  exports: [
    CartModule,
    AddressesModule,
    CheckoutModule,
    OrdersModule,
    BuyerReviewsModule,
  ],
})
export class BuyerApiModule {}
