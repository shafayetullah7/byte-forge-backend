import { ListPublicCampaignsFeedQuery } from '../../list-public-campaigns-feed.query';
import type { CampaignRepository } from '../../../../repositories/campaign.repository';
import type { CheckSellerSubscriptionQuery } from '@/modules/subscription/application/queries/check-seller-subscription.query';

describe('ListPublicCampaignsFeedQuery', () => {
  it('delegates to repository with entitlement filter', async () => {
    const listPublicFeedPage = jest.fn().mockResolvedValue({
      data: [
        {
          shopSlug: 'green-leaf',
          shopName: 'Green Leaf',
          campaign: { id: 'c1', slug: 'sale', title: 'Sale' },
        },
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 24,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
    });

    const campaignRepository = {
      listPublicFeedPage,
    } as unknown as CampaignRepository;

    const entitlementSql = Symbol('entitlement') as never;
    const checkSellerSubscription = {
      shopHasActiveEntitlement: jest.fn().mockReturnValue(entitlementSql),
    } as unknown as CheckSellerSubscriptionQuery;

    const query = new ListPublicCampaignsFeedQuery(
      campaignRepository,
      checkSellerSubscription,
    );

    const result = await query.execute({ page: 1, limit: 8 }, 'en');

    expect(checkSellerSubscription.shopHasActiveEntitlement).toHaveBeenCalled();
    expect(listPublicFeedPage).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 8,
        shopEntitlementCondition: entitlementSql,
      }),
      'en',
    );
    expect(result.data).toHaveLength(1);
    expect(result.data[0].shopSlug).toBe('green-leaf');
  });
});
