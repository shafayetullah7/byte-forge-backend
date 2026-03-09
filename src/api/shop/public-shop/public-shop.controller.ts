import { Controller, Get, Param } from '@nestjs/common';
import { PublicShopService } from './public-shop.service';

@Controller('public/shops')
export class PublicShopController {
  constructor(private readonly publicShopService: PublicShopService) {}

  @Get(':slug')
  async getPublicShopBySlug(@Param('slug') slug: string) {
    return this.publicShopService.getPublicShopBySlug(slug);
  }
}
