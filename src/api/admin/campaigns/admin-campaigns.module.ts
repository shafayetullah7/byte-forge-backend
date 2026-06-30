import { Module } from '@nestjs/common';
import { AdminAuthGuardModule } from '@/common/guards/admin-auth-guard/admin-auth-guard.module';
import { ShopCampaignRepositoryModule } from '@/_repositories/business/shop-campaign.repository/shop-campaign.repository.module';
import { AdminCampaignsController } from './admin-campaigns.controller';
import { AdminCampaignsService } from './admin-campaigns.service';

@Module({
  imports: [AdminAuthGuardModule, ShopCampaignRepositoryModule],
  controllers: [AdminCampaignsController],
  providers: [AdminCampaignsService],
})
export class AdminCampaignsModule {}
