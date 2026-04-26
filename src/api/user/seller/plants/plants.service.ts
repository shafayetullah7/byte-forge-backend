import { Injectable, HttpStatus } from '@nestjs/common';
import { CreatePlantDto } from './dto/create-plant.dto';
import { ListPlantsQueryDto } from './dto/list-plants-query.dto';
import { CreatePlantService } from './services/create-plant.service';
import { ListPlantsService } from './services/list-plants.service';
import { ShopRepository } from '@/_repositories/business/shop.repository/shop.repository';
import { I18nService } from 'nestjs-i18n';
import { CustomException } from '@/common/exceptions/custom.exception';
import { ErrorCode } from '@/common/modules/response/dto/error.schema';

@Injectable()
export class PlantsService {
  constructor(
    private readonly createPlantService: CreatePlantService,
    private readonly listPlantsService: ListPlantsService,
    private readonly shopRepository: ShopRepository,
    private readonly i18n: I18nService,
  ) {}

  async createPlant(userId: string, dto: CreatePlantDto, lang: string) {
    const shop = await this.resolveShop(userId, lang);
    return this.createPlantService.execute(shop.id, userId, dto, lang);
  }

  async getPlants(userId: string, query: ListPlantsQueryDto, lang: string) {
    const shop = await this.resolveShop(userId, lang);
    return this.listPlantsService.execute(shop.id, query);
  }

  private async resolveShop(userId: string, lang: string) {
    const shop = await this.shopRepository.getShopByOwnerId(userId);

    if (!shop) {
      throw new CustomException({
        message: this.i18n.t('message.error.shopNotFound', { lang }),
        statusCode: HttpStatus.NOT_FOUND,
        errorCode: ErrorCode.NOT_FOUND,
      });
    }

    return shop;
  }
}
