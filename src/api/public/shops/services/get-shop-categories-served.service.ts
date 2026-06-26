import { Injectable } from '@nestjs/common';
import { ShopStorefrontRepository } from '@/_repositories/business/shop-storefront.repository/shop-storefront.repository';

@Injectable()
export class GetShopCategoriesServedService {
  constructor(
    private readonly shopStorefrontRepository: ShopStorefrontRepository,
  ) {}

  execute(shopId: string, lang: string): Promise<string[]> {
    return this.shopStorefrontRepository.getCategoriesServed(shopId, lang);
  }
}
