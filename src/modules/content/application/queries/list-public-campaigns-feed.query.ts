import { Injectable } from '@nestjs/common';
import { shopTable } from '@/_db/drizzle/schema/shop';
import { CheckSellerSubscriptionQuery } from '@/modules/subscription/application/queries/check-seller-subscription.query';
import type { ListCampaignsFeedQueryDto } from '../../controllers/dto/list-campaigns-feed-query.dto';
import { CampaignRepository } from '../../repositories/campaign.repository';

@Injectable()
export class ListPublicCampaignsFeedQuery {
  constructor(
    private readonly campaignRepository: CampaignRepository,
    private readonly checkSellerSubscription: CheckSellerSubscriptionQuery,
  ) {}

  execute(query: ListCampaignsFeedQueryDto, lang: string) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 24;
    const now = new Date();

    return this.campaignRepository.listPublicFeedPage(
      {
        page,
        limit,
        now,
        shopEntitlementCondition:
          this.checkSellerSubscription.shopHasActiveEntitlement(
            shopTable.id,
            now,
          ),
      },
      lang,
    );
  }
}
