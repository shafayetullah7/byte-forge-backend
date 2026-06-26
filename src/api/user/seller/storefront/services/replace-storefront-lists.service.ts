import { Injectable, BadRequestException } from '@nestjs/common';
import { ShopStorefrontRepository } from '@/_repositories/business/shop-storefront.repository/shop-storefront.repository';
import { ReplaceStorefrontListDto } from '../dto/replace-storefront-list.dto';
import { GetStorefrontService } from './get-storefront.service';

@Injectable()
export class ReplaceWhyChooseUsService {
  constructor(
    private readonly shopStorefrontRepository: ShopStorefrontRepository,
    private readonly getStorefrontService: GetStorefrontService,
  ) {}

  async execute(shopId: string, dto: ReplaceStorefrontListDto, lang: string) {
    try {
      await this.shopStorefrontRepository.replaceWhyChooseUs(shopId, dto.items);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Maximum')) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
    return this.getStorefrontService.execute(shopId, lang);
  }
}

@Injectable()
export class ReplaceValuePointsService {
  constructor(
    private readonly shopStorefrontRepository: ShopStorefrontRepository,
    private readonly getStorefrontService: GetStorefrontService,
  ) {}

  async execute(shopId: string, dto: ReplaceStorefrontListDto, lang: string) {
    try {
      await this.shopStorefrontRepository.replaceValuePoints(shopId, dto.items);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Maximum')) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
    return this.getStorefrontService.execute(shopId, lang);
  }
}
