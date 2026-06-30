import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ShopCampaignRepository } from '@/_repositories/business/shop-campaign.repository/shop-campaign.repository';
import { ShopContentModerationStatusEnum } from '@/_db/drizzle/enum';
import { AdminCampaignsQueryDto } from './dto/admin-campaigns-query.dto';
import { RejectCampaignDto } from './dto/reject-campaign.dto';

type ShopWithTranslations = {
  id: string;
  slug: string;
  translations?: Array<{ locale: string; name: string }>;
};

type CampaignAdminRow = {
  id: string;
  shopId: string;
  slug: string;
  type: string;
  bannerId: string | null;
  discountPercent: number | null;
  startDate: Date;
  endDate: Date;
  moderationStatus: string;
  rejectedReason: string | null;
  moderatedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  translations: Array<{
    locale: string;
    title: string;
    description: string | null;
  }>;
  banner?: { id: string; url: string } | null;
  shop?: ShopWithTranslations | null;
  products?: Array<{
    productId: string;
    product?: {
      id: string;
      slug: string;
      translations?: Array<{ locale: string; name: string }>;
    } | null;
  }>;
};

@Injectable()
export class AdminCampaignsService {
  constructor(private readonly campaignRepository: ShopCampaignRepository) {}

  async listCampaigns(query: AdminCampaignsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const result = await this.campaignRepository.listAdmin({
      page,
      limit,
      search: query.search,
      moderationStatus: query.moderationStatus,
    });

    return {
      data: result.data.map((campaign) =>
        this.mapCampaignListItem(campaign as CampaignAdminRow),
      ),
      meta: result.meta,
    };
  }

  async getCampaign(campaignId: string) {
    const campaign = await this.campaignRepository.findByIdForAdmin(campaignId);
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
    return this.mapCampaignDetail(campaign);
  }

  async approveCampaign(campaignId: string, adminId: string) {
    const campaign = await this.campaignRepository.findByIdForAdmin(campaignId);
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
    if (campaign.moderationStatus !== ShopContentModerationStatusEnum.PENDING) {
      throw new BadRequestException('Only pending campaigns can be approved');
    }

    const updated = await this.campaignRepository.updateModerationStatus(
      campaignId,
      ShopContentModerationStatusEnum.APPROVED,
      {
        rejectedReason: null,
        moderatedByAdminId: adminId,
        moderatedAt: new Date(),
      },
    );

    if (!updated) {
      throw new NotFoundException('Campaign not found');
    }

    return this.getCampaign(campaignId);
  }

  async rejectCampaign(
    campaignId: string,
    adminId: string,
    dto: RejectCampaignDto,
  ) {
    const campaign = await this.campaignRepository.findByIdForAdmin(campaignId);
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
    if (campaign.moderationStatus !== ShopContentModerationStatusEnum.PENDING) {
      throw new BadRequestException('Only pending campaigns can be rejected');
    }

    const updated = await this.campaignRepository.updateModerationStatus(
      campaignId,
      ShopContentModerationStatusEnum.REJECTED,
      {
        rejectedReason: dto.reason,
        moderatedByAdminId: adminId,
        moderatedAt: new Date(),
      },
    );

    if (!updated) {
      throw new NotFoundException('Campaign not found');
    }

    return this.getCampaign(campaignId);
  }

  private mapCampaignListItem(campaign: CampaignAdminRow) {
    const en = campaign.translations.find((t) => t.locale === 'en');
    return {
      id: campaign.id,
      slug: campaign.slug,
      type: campaign.type,
      title: en?.title ?? '',
      moderationStatus: campaign.moderationStatus,
      startDate: campaign.startDate.toISOString(),
      endDate: campaign.endDate.toISOString(),
      shop: this.mapShopSummary(campaign.shop),
      createdAt: campaign.createdAt.toISOString(),
    };
  }

  private mapCampaignDetail(campaign: CampaignAdminRow) {
    const en = campaign.translations.find((t) => t.locale === 'en');
    const bn = campaign.translations.find((t) => t.locale === 'bn');

    return {
      id: campaign.id,
      shopId: campaign.shopId,
      slug: campaign.slug,
      type: campaign.type,
      banner: campaign.banner
        ? { id: campaign.banner.id, url: campaign.banner.url }
        : null,
      discountPercent: campaign.discountPercent,
      startDate: campaign.startDate.toISOString(),
      endDate: campaign.endDate.toISOString(),
      moderationStatus: campaign.moderationStatus,
      rejectedReason: campaign.rejectedReason,
      moderatedAt: campaign.moderatedAt?.toISOString() ?? null,
      title: en?.title ?? '',
      translations: {
        en: {
          title: en?.title ?? '',
          description: en?.description ?? null,
        },
        bn: {
          title: bn?.title ?? '',
          description: bn?.description ?? null,
        },
      },
      products:
        campaign.products?.map((row) => ({
          id: row.product?.id ?? row.productId,
          slug: row.product?.slug ?? '',
          name:
            row.product?.translations?.find((t) => t.locale === 'en')?.name ??
            '',
        })) ?? [],
      shop: this.mapShopSummary(campaign.shop),
      createdAt: campaign.createdAt.toISOString(),
      updatedAt: campaign.updatedAt.toISOString(),
    };
  }

  private mapShopSummary(shop?: ShopWithTranslations | null) {
    if (!shop) return null;
    const en = shop.translations?.find((t) => t.locale === 'en');
    return {
      id: shop.id,
      slug: shop.slug,
      name: en?.name ?? shop.slug,
    };
  }
}
