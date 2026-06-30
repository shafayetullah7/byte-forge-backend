import { Module } from '@nestjs/common';
import { CartModule } from './cart/cart.module';
import { AddressesModule } from './addresses/addresses.module';
import { CheckoutModule } from './checkout/checkout.module';
import { OrdersModule } from './orders/orders.module';
import { BuyerReviewsModule } from './reviews/buyer-reviews.module';
import { ShopFollowModule } from './shop-follow/shop-follow.module';
import { WishlistModule } from './wishlist/wishlist.module';

@Module({
  imports: [
    CartModule,
    AddressesModule,
    CheckoutModule,
    OrdersModule,
    BuyerReviewsModule,
    ShopFollowModule,
    WishlistModule,
  ],
  exports: [
    CartModule,
    AddressesModule,
    CheckoutModule,
    OrdersModule,
    BuyerReviewsModule,
    ShopFollowModule,
    WishlistModule,
  ],
})
export class BuyerApiModule {}
