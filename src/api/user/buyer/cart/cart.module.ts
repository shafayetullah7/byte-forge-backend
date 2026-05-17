import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { GetCartService } from './services/get-cart.service';
import { AddToCartService } from './services/add-to-cart.service';
import { UpdateCartItemService } from './services/update-cart-item.service';
import { RemoveCartItemService } from './services/remove-cart-item.service';
import { ClearCartService } from './services/clear-cart.service';
import { CartRepositoryModule } from '@/_repositories/user/cart.repository/cart.repository.module';
import { UserAuthGuardModule } from '@/common/guards/user-auth-guard/user-auth-guard.module';

@Module({
  controllers: [CartController],
  providers: [
    CartService,
    GetCartService,
    AddToCartService,
    UpdateCartItemService,
    RemoveCartItemService,
    ClearCartService,
  ],
  imports: [CartRepositoryModule, UserAuthGuardModule],
  exports: [CartService],
})
export class CartModule {}
