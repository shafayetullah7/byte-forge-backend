import { Module } from '@nestjs/common';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import {
  ListCampaignsService,
  GetCampaignService,
} from './services/campaign-queries.service';
import {
  CreateCampaignService,
  UpdateCampaignService,
  SubmitCampaignService,
  ArchiveCampaignService,
  DeleteCampaignService,
} from './services/campaign-mutations.service';
import { ShopCampaignRepositoryModule } from '@/_repositories/business/shop-campaign.repository/shop-campaign.repository.module';
import { VerifiedUserAuthGuardModule } from '@/common/guards/verified-user-auth-guard/verified-user-auth.guard.module';
import { SellerShopGuardModule } from '@/common/guards/seller-shop-guard/seller-shop.guard.module';

@Module({
  controllers: [CampaignsController],
  providers: [
    CampaignsService,
    ListCampaignsService,
    GetCampaignService,
    CreateCampaignService,
    UpdateCampaignService,
    SubmitCampaignService,
    ArchiveCampaignService,
    DeleteCampaignService,
  ],
  imports: [
    ShopCampaignRepositoryModule,
    VerifiedUserAuthGuardModule,
    SellerShopGuardModule,
  ],
})
export class CampaignsModule {}
