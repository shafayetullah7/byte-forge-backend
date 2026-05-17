import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartItemIdParamsDto } from './dto/cart-item-id.params.dto';
import { UserAuthGuard } from '@/common/guards/user-auth-guard/user-auth.guard';
import { AuthenticUser } from '@/common/decorators/authentic-user.decorator';
import { TAuthenticUser } from '@/common/types';
import { ResponseService } from '@/common/modules/response/response.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  ApiAuth,
  ApiOkResponseTyped,
} from '@/common/decorators/swagger.decorators';
import {
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
} from '@/common/decorators/api-error.decorator';
import { CartDto, CartItemDto } from './dto/cart-response.dto';
import { I18nLang, I18nService } from 'nestjs-i18n';

@ApiTags('🛒 Cart Management')
@Controller({ path: 'cart', version: '1' })
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly responseService: ResponseService,
    private readonly i18n: I18nService,
  ) {}

  @ApiAuth()
  @ApiOperation({
    summary: 'Get current cart',
    description: 'Returns the authenticated user\'s cart with all items',
  })
  @ApiOkResponseTyped(CartDto, 'Cart retrieved successfully')
  @ApiUnauthorizedResponse()
  @Get()
  @UseGuards(UserAuthGuard)
  async getCart(
    @AuthenticUser() authenticUser: TAuthenticUser,
    @I18nLang() lang: string,
  ) {
    const cart = await this.cartService.getCart(authenticUser.user.id);

    if (!cart) {
      return this.responseService.success({
        message: this.i18n.t('message.success.cartRetrieved', { lang }),
        data: null,
      });
    }

    return this.responseService.success({
      message: this.i18n.t('message.success.cartRetrieved', { lang }),
      data: cart,
    });
  }

  @ApiAuth()
  @ApiOperation({
    summary: 'Add item to cart',
    description: 'Adds a product variant to the user\'s cart. If the variant already exists in the cart, the quantity is incremented.',
  })
  @ApiResponse({
    status: 201,
    description: 'Item added to cart successfully',
    type: CartItemDto,
  })
  @ApiBadRequestResponse('Validation failed / Insufficient stock / Product unavailable')
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse('Product variant not found')
  @Post('items')
  @UseGuards(UserAuthGuard)
  async addToCart(
    @Body() dto: AddToCartDto,
    @AuthenticUser() authenticUser: TAuthenticUser,
    @I18nLang() lang: string,
  ) {
    const item = await this.cartService.addToCart(authenticUser.user.id, dto);

    return this.responseService.success({
      message: this.i18n.t('message.success.itemAddedToCart', { lang }),
      data: item,
    });
  }

  @ApiAuth()
  @ApiOperation({
    summary: 'Update cart item quantity',
    description: 'Updates the quantity of an existing cart item',
  })
  @ApiResponse({
    status: 200,
    description: 'Cart item updated successfully',
    type: CartItemDto,
  })
  @ApiBadRequestResponse('Validation failed / Insufficient stock / Product unavailable')
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse('Cart item not found')
  @ApiForbiddenResponse('Permission denied')
  @Patch('items/:itemId')
  @UseGuards(UserAuthGuard)
  async updateCartItem(
    @Param() params: CartItemIdParamsDto,
    @Body() dto: UpdateCartItemDto,
    @AuthenticUser() authenticUser: TAuthenticUser,
    @I18nLang() lang: string,
  ) {
    const item = await this.cartService.updateCartItem(
      authenticUser.user.id,
      params.itemId,
      dto,
    );

    return this.responseService.success({
      message: this.i18n.t('message.success.cartItemUpdated', { lang }),
      data: item,
    });
  }

  @ApiAuth()
  @ApiOperation({
    summary: 'Remove item from cart',
    description: 'Removes a specific item from the user\'s cart',
  })
  @ApiResponse({
    status: 200,
    description: 'Item removed from cart successfully',
  })
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse('Cart item not found')
  @ApiForbiddenResponse('Permission denied')
  @Delete('items/:itemId')
  @UseGuards(UserAuthGuard)
  async removeCartItem(
    @Param() params: CartItemIdParamsDto,
    @AuthenticUser() authenticUser: TAuthenticUser,
    @I18nLang() lang: string,
  ) {
    await this.cartService.removeCartItem(authenticUser.user.id, params.itemId);

    return this.responseService.success({
      message: this.i18n.t('message.success.cartItemRemoved', { lang }),
      data: null,
    });
  }

  @ApiAuth()
  @ApiOperation({
    summary: 'Clear entire cart',
    description: 'Removes all items from the user\'s cart',
  })
  @ApiResponse({
    status: 200,
    description: 'Cart cleared successfully',
  })
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse('Cart not found')
  @Delete()
  @UseGuards(UserAuthGuard)
  async clearCart(
    @AuthenticUser() authenticUser: TAuthenticUser,
    @I18nLang() lang: string,
  ) {
    await this.cartService.clearCart(authenticUser.user.id);

    return this.responseService.success({
      message: this.i18n.t('message.success.cartCleared', { lang }),
      data: null,
    });
  }
}
