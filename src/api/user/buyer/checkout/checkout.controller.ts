import {
  Controller,
  Post,
  Body,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CalculatePriceBreakdownService } from './services/calculate-price-breakdown.service';
import { PlaceOrderService } from './services/place-order.service';
import { CalculatePriceBreakdownBodyDto } from './dto/calculate-price-breakdown-body.dto';
import { PlaceOrderBodyDto } from './dto/place-order-body.dto';
import { PriceBreakdownResponseDto } from './dto/price-breakdown-response.dto';
import { PlaceOrderResponseDto } from './dto/place-order-response.dto';
import { CartAccessGuard } from '@/common/guards/cart-access-guard/cart-access.guard';
import { CartContextParam } from '@/common/decorators/cart-context.decorator';
import { CartContext as CartContextType } from '@/common/types/cart-context.type';
import { ResponseService } from '@/common/modules/response/response.service';
import { CartRepository } from '@/_repositories/user/cart.repository';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  ApiAuth,
  ApiOkResponseTyped,
} from '@/common/decorators/swagger.decorators';
import {
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from '@/common/decorators/api-error.decorator';
import { I18nLang, I18nService } from 'nestjs-i18n';
import { PaymentMethodEnum } from '@/_db/drizzle/enum/payment-method.enum';

@ApiTags('💳 Checkout')
@Controller({ path: 'user/buyer/checkout', version: '1' })
export class CheckoutController {
  constructor(
    private readonly calculatePriceBreakdownService: CalculatePriceBreakdownService,
    private readonly placeOrderService: PlaceOrderService,
    private readonly responseService: ResponseService,
    private readonly i18n: I18nService,
    private readonly cartRepository: CartRepository,
  ) {}

  @ApiAuth()
  @ApiOperation({
    summary: 'Calculate price breakdown',
    description:
      'Calculates the complete price breakdown for selected cart items including items subtotal, per-shop shipping costs, tax, and total based on the shipping address district.',
  })
  @ApiOkResponseTyped(PriceBreakdownResponseDto, 'Price breakdown calculated successfully')
  @ApiUnauthorizedResponse()
  @ApiBadRequestResponse('Invalid address ID, empty itemIds, or validation failed')
  @ApiNotFoundResponse('Cart not found')
  @Post('price-breakdown')
  @UseGuards(CartAccessGuard)
  async calculatePriceBreakdown(
    @Body() body: CalculatePriceBreakdownBodyDto,
    @CartContextParam() cartContext: CartContextType,
    @I18nLang() lang: string,
  ) {
    const resolved = await this.resolveCartContext(cartContext);
    const breakdown = await this.calculatePriceBreakdownService.executeByCartId(
      resolved.cartId,
      body.addressId,
      body.itemIds,
      lang,
    );

    return this.responseService.success({
      message: this.i18n.t('message.success.priceBreakdownCalculated', { lang }),
      data: { breakdown },
    });
  }

  @ApiAuth()
  @ApiOperation({
    summary: 'Place order (Cash on Delivery)',
    description:
      'Creates orders for selected cart items with Cash on Delivery payment method. Groups items by shop into separate orders under one order group.',
  })
  @ApiOkResponseTyped(PlaceOrderResponseDto, 'Order placed successfully')
  @ApiUnauthorizedResponse()
  @ApiBadRequestResponse('Invalid request, insufficient stock, or unsupported payment method')
  @ApiNotFoundResponse('Cart or address not found')
  @Post('place-order')
  @UseGuards(CartAccessGuard)
  async placeOrder(
    @Body() body: PlaceOrderBodyDto,
    @CartContextParam() cartContext: CartContextType,
    @I18nLang() lang: string,
  ) {
    if (!cartContext.userId) {
      throw new BadRequestException('Guest checkout is not supported. Please sign in to place an order.');
    }

    const resolved = await this.resolveCartContext(cartContext);

    const result = await this.placeOrderService.execute(
      resolved.cartId,
      cartContext.userId,
      body.addressId,
      body.itemIds,
      PaymentMethodEnum.COD,
      body.notes,
    );

    return this.responseService.success({
      message: this.i18n.t('message.success.orderPlaced', { lang }),
      data: { orderGroup: result },
    });
  }

  private async resolveCartContext(
    context: CartContextType,
  ): Promise<{ cartId: string }> {
    const { userId, guestToken } = context;

    if (userId) {
      const cart = await this.cartRepository.getCartByUserId(userId);
      if (!cart) {
        throw new NotFoundException('Cart not found');
      }
      return { cartId: cart.id };
    }

    if (guestToken) {
      const cart = await this.cartRepository.getCartByGuestToken(guestToken);
      if (!cart) {
        throw new NotFoundException('Cart not found');
      }
      return { cartId: cart.id };
    }

    throw new NotFoundException('No valid cart context provided');
  }
}
