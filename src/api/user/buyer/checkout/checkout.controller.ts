import {
  Controller,
  Get,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { CalculatePriceBreakdownService } from './services/calculate-price-breakdown.service';
import { CalculatePriceBreakdownQueryDto } from './dto/calculate-price-breakdown-query.dto';
import { PriceBreakdownResponseDto } from './dto/price-breakdown-response.dto';
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

@ApiTags('💳 Checkout')
@Controller({ path: 'user/buyer/checkout', version: '1' })
export class CheckoutController {
  constructor(
    private readonly calculatePriceBreakdownService: CalculatePriceBreakdownService,
    private readonly responseService: ResponseService,
    private readonly i18n: I18nService,
    private readonly cartRepository: CartRepository,
  ) {}

  @ApiAuth()
  @ApiOperation({
    summary: 'Calculate price breakdown',
    description:
      'Calculates the complete price breakdown for the current cart including items subtotal, per-shop shipping costs, tax, and total based on the delivery district.',
  })
  @ApiOkResponseTyped(PriceBreakdownResponseDto, 'Price breakdown calculated successfully')
  @ApiUnauthorizedResponse()
  @ApiBadRequestResponse('Invalid district ID or empty cart')
  @ApiNotFoundResponse('Cart not found')
  @Get('price-breakdown')
  @UseGuards(CartAccessGuard)
  async calculatePriceBreakdown(
    @Query() query: CalculatePriceBreakdownQueryDto,
    @CartContextParam() cartContext: CartContextType,
    @I18nLang() lang: string,
  ) {
    const resolved = await this.resolveCartContext(cartContext);
    const breakdown = await this.calculatePriceBreakdownService.executeByCartId(
      resolved.cartId,
      query.districtId,
      lang,
    );

    return this.responseService.success({
      message: this.i18n.t('message.success.priceBreakdownCalculated', { lang }),
      data: { breakdown },
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
