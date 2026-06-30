import { Injectable, NotFoundException } from '@nestjs/common';
import { ShopCampaignRepository } from '@/_repositories/business/shop-campaign.repository/shop-campaign.repository';
import { ListCampaignsQueryDto } from '../dto/list-campaigns-query.dto';
import {
  mapSellerCampaign,
  mapSellerCampaignListItem,
} from '../campaigns.mapper';

@Injectable()
export class ListCampaignsService {
  constructor(private readonly campaignRepository: ShopCampaignRepository) {}

  async execute(shopId: string, query: ListCampaignsQueryDto) {
    const result = await this.campaignRepository.listByShopId(shopId, query);
    return {
      data: result.data.map(mapSellerCampaignListItem),
      meta: result.meta,
    };
  }
}

@Injectable()
export class GetCampaignService {
  constructor(private readonly campaignRepository: ShopCampaignRepository) {}

  async execute(shopId: string, campaignId: string) {
    const campaign = await this.campaignRepository.findByIdForShop(
      shopId,
      campaignId,
    );
    if (!campaign) throw new NotFoundException('Campaign not found');
    return mapSellerCampaign(campaign);
  }
}
