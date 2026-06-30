import { Module } from '@nestjs/common';
import { ShopCampaignRepository } from './shop-campaign.repository';

@Module({
  providers: [ShopCampaignRepository],
  exports: [ShopCampaignRepository],
})
export class ShopCampaignRepositoryModule {}
