import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto, CartQueryDto } from './dto/cart.dto';
import { UserAuthGuard } from '@/common/guards/user-auth-guard/user-auth.guard';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Request() req, @Query() query: CartQueryDto) {
    const userId = req.user?.id || null;
    const sessionId = query.sessionId || null;
    return this.cartService.getCart(userId, sessionId || undefined);
  }

  @UseGuards(UserAuthGuard)
  @Post('items')
  async addToCart(@Request() req, @Body() dto: AddToCartDto) {
    const userId = req.user?.id || null;
    return this.cartService.addToCart(userId, null, dto);
  }

  @UseGuards(UserAuthGuard)
  @Patch('items/:id')
  async updateCartItem(@Request() req, @Body() dto: UpdateCartItemDto) {
    const userId = req.user?.id || null;
    return this.cartService.updateCartItem(userId, null, req.params.id, dto);
  }

  @UseGuards(UserAuthGuard)
  @Delete('items/:id')
  async removeCartItem(@Request() req) {
    const userId = req.user?.id || null;
    return this.cartService.removeCartItem(userId, null, req.params.id);
  }

  @UseGuards(UserAuthGuard)
  @Delete()
  async clearCart(@Request() req) {
    const userId = req.user?.id || null;
    return this.cartService.clearCart(userId, null);
  }
}
