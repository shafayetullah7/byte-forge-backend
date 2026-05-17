import { Injectable } from '@nestjs/common';
import { GetCartService, CartResult } from './services/get-cart.service';
import { AddToCartService, AddToCartResult } from './services/add-to-cart.service';
import { UpdateCartItemService, UpdateCartItemResult } from './services/update-cart-item.service';
import { RemoveCartItemService } from './services/remove-cart-item.service';
import { ClearCartService } from './services/clear-cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    private readonly getCartService: GetCartService,
    private readonly addToCartService: AddToCartService,
    private readonly updateCartItemService: UpdateCartItemService,
    private readonly removeCartItemService: RemoveCartItemService,
    private readonly clearCartService: ClearCartService,
  ) {}

  getCart(userId: string): Promise<CartResult | null> {
    return this.getCartService.execute(userId);
  }

  addToCart(userId: string, dto: AddToCartDto): Promise<AddToCartResult> {
    return this.addToCartService.execute(userId, dto);
  }

  updateCartItem(
    userId: string,
    itemId: string,
    dto: UpdateCartItemDto,
  ): Promise<UpdateCartItemResult> {
    return this.updateCartItemService.execute(userId, itemId, dto);
  }

  removeCartItem(userId: string, itemId: string): Promise<void> {
    return this.removeCartItemService.execute(userId, itemId);
  }

  clearCart(userId: string): Promise<void> {
    return this.clearCartService.execute(userId);
  }
}
