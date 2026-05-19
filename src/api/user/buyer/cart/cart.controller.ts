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
import { BulkUpdateCartItemsDto } from './dto/bulk-update-items.dto';
import { BulkRemoveCartItemsDto } from './dto/bulk-remove-items.dto';
import { MergeCartDto } from './dto/merge-cart.dto';
import { CartAccessGuard } from '@/common/guards/cart-access-guard/cart-access.guard';
import { CartContextParam } from '@/common/decorators/cart-context.decorator';
import { CartContext as CartContextType } from '@/common/types/cart-context.type';
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
import {
  CartDto,
  CartItemDto,
  CartValidationResultDto,
  BulkUpdateResultDto,
  BulkRemoveResultDto,
  MergeCartResultDto,
} from './dto/cart-response.dto';
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
    description:
      "Returns the authenticated user's cart with all items, totals, stock status, and variant attributes",
  })
  @ApiOkResponseTyped(CartDto, 'Cart retrieved successfully')
  @ApiUnauthorizedResponse()
  @Get()
  @UseGuards(CartAccessGuard)
  async getCart(
    @CartContextParam() cartContext: CartContextType,
    @I18nLang() lang: string,
  ) {
    const cart = await this.cartService.getCart(cartContext, lang);

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
    description:
      "Adds a product variant to the user's cart. If the variant already exists in the cart, the quantity is incremented.",
  })
  @ApiResponse({
    status: 201,
    description: 'Item added to cart successfully',
    type: CartItemDto,
  })
  @ApiBadRequestResponse(
    'Validation failed / Insufficient stock / Product unavailable',
  )
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse('Product variant not found')
  @Post('items')
  @UseGuards(CartAccessGuard)
  async addToCart(
    @Body() dto: AddToCartDto,
    @CartContextParam() cartContext: CartContextType,
    @I18nLang() lang: string,
  ) {
    const item = await this.cartService.addToCart(cartContext, dto, lang);

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
  @ApiBadRequestResponse(
    'Validation failed / Insufficient stock / Product unavailable',
  )
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse('Cart item not found')
  @ApiForbiddenResponse('Permission denied')
  @Patch('items/:itemId')
  @UseGuards(CartAccessGuard)
  async updateCartItem(
    @Param() params: CartItemIdParamsDto,
    @Body() dto: UpdateCartItemDto,
    @CartContextParam() cartContext: CartContextType,
    @I18nLang() lang: string,
  ) {
    const item = await this.cartService.updateCartItem(
      cartContext,
      params.itemId,
      dto,
      lang,
    );

    return this.responseService.success({
      message: this.i18n.t('message.success.cartItemUpdated', { lang }),
      data: item,
    });
  }

  @ApiAuth()
  @ApiOperation({
    summary: 'Remove item from cart',
    description: "Removes a specific item from the user's cart",
  })
  @ApiResponse({
    status: 200,
    description: 'Item removed from cart successfully',
  })
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse('Cart item not found')
  @ApiForbiddenResponse('Permission denied')
  @Delete('items/:itemId')
  @UseGuards(CartAccessGuard)
  async removeCartItem(
    @Param() params: CartItemIdParamsDto,
    @CartContextParam() cartContext: CartContextType,
    @I18nLang() lang: string,
  ) {
    await this.cartService.removeCartItem(cartContext, params.itemId);

    return this.responseService.success({
      message: this.i18n.t('message.success.cartItemRemoved', { lang }),
      data: null,
    });
  }

  @ApiAuth()
  @ApiOperation({
    summary: 'Clear entire cart',
    description: "Removes all items from the user's cart",
  })
  @ApiResponse({
    status: 200,
    description: 'Cart cleared successfully',
  })
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse('Cart not found')
  @Delete()
  @UseGuards(CartAccessGuard)
  async clearCart(
    @CartContextParam() cartContext: CartContextType,
    @I18nLang() lang: string,
  ) {
    await this.cartService.clearCart(cartContext);

    return this.responseService.success({
      message: this.i18n.t('message.success.cartCleared', { lang }),
      data: null,
    });
  }

  @ApiAuth()
  @ApiOperation({
    summary: 'Validate cart',
    description:
      'Checks if all items in the cart are still available and purchasable. Useful before checkout.',
  })
  @ApiOkResponseTyped(CartValidationResultDto, 'Cart validated successfully')
  @ApiUnauthorizedResponse()
  @Post('validate')
  @UseGuards(CartAccessGuard)
  async validateCart(
    @CartContextParam() cartContext: CartContextType,
    @I18nLang() lang: string,
  ) {
    const result = await this.cartService.validateCart(cartContext, lang);

    return this.responseService.success({
      message: this.i18n.t('message.success.cartValidated', { lang }),
      data: result,
    });
  }

  @ApiAuth()
  @ApiOperation({
    summary: 'Bulk update cart items',
    description:
      'Updates quantities of multiple cart items in a single request. Set quantity to 0 to remove an item.',
  })
  @ApiOkResponseTyped(BulkUpdateResultDto, 'Cart items updated successfully')
  @ApiUnauthorizedResponse()
  @ApiBadRequestResponse('Validation failed')
  @Patch('items/bulk')
  @UseGuards(CartAccessGuard)
  async bulkUpdateCartItems(
    @Body() dto: BulkUpdateCartItemsDto,
    @CartContextParam() cartContext: CartContextType,
    @I18nLang() lang: string,
  ) {
    const result = await this.cartService.bulkUpdateCartItems(
      cartContext,
      dto,
      lang,
    );

    return this.responseService.success({
      message: this.i18n.t('message.success.cartItemsBulkUpdated', { lang }),
      data: result,
    });
  }

  @ApiAuth()
  @ApiOperation({
    summary: 'Bulk remove cart items',
    description: 'Removes multiple items from the cart in a single request',
  })
  @ApiOkResponseTyped(BulkRemoveResultDto, 'Cart items removed successfully')
  @ApiUnauthorizedResponse()
  @ApiBadRequestResponse('Validation failed')
  @Delete('items/bulk')
  @UseGuards(CartAccessGuard)
  async bulkRemoveCartItems(
    @Body() dto: BulkRemoveCartItemsDto,
    @CartContextParam() cartContext: CartContextType,
    @I18nLang() lang: string,
  ) {
    const result = await this.cartService.bulkRemoveCartItems(cartContext, dto);

    return this.responseService.success({
      message: this.i18n.t('message.success.cartItemsBulkRemoved', { lang }),
      data: result,
    });
  }

  @ApiAuth()
  @ApiOperation({
    summary: 'Merge guest cart items',
    description:
      "Merges guest cart items (from localStorage) into the authenticated user's cart",
  })
  @ApiOkResponseTyped(MergeCartResultDto, 'Cart merged successfully')
  @ApiUnauthorizedResponse()
  @ApiBadRequestResponse('Validation failed')
  @Post('merge')
  @UseGuards(CartAccessGuard)
  async mergeCart(
    @Body() dto: MergeCartDto,
    @CartContextParam() cartContext: CartContextType,
    @I18nLang() lang: string,
  ) {
    const result = await this.cartService.mergeCart(cartContext, dto, lang);

    return this.responseService.success({
      message: this.i18n.t('message.success.cartMerged', { lang }),
      data: result,
    });
  }
}
