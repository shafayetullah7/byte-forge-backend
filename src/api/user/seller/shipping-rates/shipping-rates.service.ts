import { HttpStatus, Injectable } from '@nestjs/common';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { ShopRepository } from '@/_repositories/business/shop.repository/shop.repository';
import { ShopShippingRatesRepository } from '@/_repositories/business/shop.shipping-rates.repository/shop.shipping-rates.repository';
import { I18nService } from 'nestjs-i18n';
import { CustomException } from '@/common/exceptions/custom.exception';
import { ErrorCode } from '@/common/modules/response/dto/error.schema';

export type ShippingRate = {
  id: string;
  shopId: string;
  districtId: string;
  cost: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class ShippingRatesService {
  constructor(
    private readonly db: DrizzleService,
    private readonly shopRepository: ShopRepository,
    private readonly shopShippingRatesRepository: ShopShippingRatesRepository,
    private readonly i18n: I18nService,
  ) {}

  async getShippingRates(shopId: string): Promise<ShippingRate[]> {
    const rates = await this.shopShippingRatesRepository.findByShop(shopId);
    return rates.map((r) => ({
      id: r.id,
      shopId: r.shopId,
      districtId: r.districtId,
      cost: r.cost,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  async bulkUpdateShippingRates(
    shopId: string,
    rates: { districtId: string; cost: string }[],
    lang: string,
  ): Promise<ShippingRate[]> {
    return this.db.transaction(async (tx) => {
      const shop = await this.shopRepository.getShopById(shopId, {
        tx,
        lock: true,
      });

      if (!shop) {
        throw new CustomException({
          message: this.i18n.t('message.error.shopNotFound', { lang }),
          statusCode: HttpStatus.NOT_FOUND,
          errorCode: ErrorCode.NOT_FOUND,
        });
      }

      const updated = await this.shopShippingRatesRepository.upsertBulk(
        shopId,
        rates,
        tx,
      );

      return updated.map((r) => ({
        id: r.id,
        shopId: r.shopId,
        districtId: r.districtId,
        cost: r.cost,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));
    });
  }
}
