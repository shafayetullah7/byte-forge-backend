import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ShopCampaignRepository } from '@/_repositories/business/shop-campaign.repository/shop-campaign.repository';
import { ShopContentModerationStatusEnum } from '@/_db/drizzle/enum';
import { CreateCampaignDto } from '../dto/create-campaign.dto';
import { UpdateCampaignDto } from '../dto/update-campaign.dto';
import {
  assertDeletableStatus,
  assertEditableStatus,
  mapSellerCampaign,
} from '../campaigns.mapper';
import type { CampaignTranslationInput } from '@/_repositories/business/shop-campaign.repository/shop-campaign.repository';

@Injectable()
export class CreateCampaignService {
  constructor(private readonly campaignRepository: ShopCampaignRepository) {}

  async execute(shopId: string, dto: CreateCampaignDto) {
    const productIds = dto.productIds ?? [];
    if (productIds.length > 0) {
      const valid = await this.campaignRepository.validateProductIdsForShop(
        shopId,
        productIds,
      );
      if (!valid) {
        throw new BadRequestException(
          'One or more products are invalid or not active',
        );
      }
    }

    const slug =
      dto.slug ??
      (await this.campaignRepository.generateUniqueSlug(
        shopId,
        dto.translations.en.title,
      ));

    if (dto.slug) {
      const taken = await this.campaignRepository.slugExists(shopId, dto.slug);
      if (taken) throw new ConflictException('Slug already exists');
    }

    const translations = {
      en: dto.translations.en,
      bn: dto.translations.bn ?? {
        title: dto.translations.en.title,
        description: dto.translations.en.description ?? null,
      },
    };

    const campaign = await this.campaignRepository.createCampaign(
      {
        shopId,
        slug,
        type: dto.type,
        bannerId: dto.bannerId ?? null,
        discountPercent: dto.discountPercent ?? null,
        startDate: dto.startDate,
        endDate: dto.endDate,
        moderationStatus: ShopContentModerationStatusEnum.DRAFT,
      },
      translations,
      productIds,
    );

    if (!campaign) throw new NotFoundException('Campaign not found');
    return mapSellerCampaign(campaign);
  }
}

@Injectable()
export class UpdateCampaignService {
  constructor(private readonly campaignRepository: ShopCampaignRepository) {}

  async execute(shopId: string, campaignId: string, dto: UpdateCampaignDto) {
    const existing = await this.campaignRepository.findByIdForShop(
      shopId,
      campaignId,
    );
    if (!existing) throw new NotFoundException('Campaign not found');
    if (!assertEditableStatus(existing.moderationStatus)) {
      throw new BadRequestException(
        'Campaign cannot be edited in current status',
      );
    }

    if (dto.productIds) {
      const valid = await this.campaignRepository.validateProductIdsForShop(
        shopId,
        dto.productIds,
      );
      if (!valid) {
        throw new BadRequestException(
          'One or more products are invalid or not active',
        );
      }
    }

    if (dto.slug && dto.slug !== existing.slug) {
      const taken = await this.campaignRepository.slugExists(
        shopId,
        dto.slug,
        campaignId,
      );
      if (taken) throw new ConflictException('Slug already exists');
    }

    const campaign = await this.campaignRepository.updateCampaign(
      shopId,
      campaignId,
      {
        slug: dto.slug,
        type: dto.type,
        bannerId: dto.bannerId,
        discountPercent: dto.discountPercent,
        startDate: dto.startDate,
        endDate: dto.endDate,
      },
      dto.translations as CampaignTranslationInput | undefined,
      dto.productIds,
    );

    if (!campaign) throw new NotFoundException('Campaign not found');
    return mapSellerCampaign(campaign);
  }
}

@Injectable()
export class SubmitCampaignService {
  constructor(private readonly campaignRepository: ShopCampaignRepository) {}

  async execute(shopId: string, campaignId: string, shopStatus: string) {
    if (shopStatus !== 'ACTIVE') {
      throw new BadRequestException('Shop must be active to submit campaigns');
    }

    const existing = await this.campaignRepository.findByIdForShop(
      shopId,
      campaignId,
    );
    if (!existing) throw new NotFoundException('Campaign not found');

    const editable =
      existing.moderationStatus === ShopContentModerationStatusEnum.DRAFT ||
      existing.moderationStatus === ShopContentModerationStatusEnum.REJECTED;
    if (!editable) {
      throw new BadRequestException('Campaign cannot be submitted');
    }

    const en = existing.translations.find((t) => t.locale === 'en');
    const bn = existing.translations.find((t) => t.locale === 'bn');
    if (!en?.title?.trim() || !bn?.title?.trim()) {
      throw new BadRequestException(
        'English and Bengali titles are required to submit',
      );
    }

    const updated = await this.campaignRepository.updateModerationStatus(
      campaignId,
      ShopContentModerationStatusEnum.PENDING,
      { rejectedReason: null },
    );

    const campaign = await this.campaignRepository.findByIdForShop(
      shopId,
      updated.id,
    );
    return mapSellerCampaign(campaign!);
  }
}

@Injectable()
export class ArchiveCampaignService {
  constructor(private readonly campaignRepository: ShopCampaignRepository) {}

  async execute(shopId: string, campaignId: string) {
    const existing = await this.campaignRepository.findByIdForShop(
      shopId,
      campaignId,
    );
    if (!existing) throw new NotFoundException('Campaign not found');

    await this.campaignRepository.updateModerationStatus(
      campaignId,
      ShopContentModerationStatusEnum.ARCHIVED,
    );

    const campaign = await this.campaignRepository.findByIdForShop(
      shopId,
      campaignId,
    );
    return mapSellerCampaign(campaign!);
  }
}

@Injectable()
export class DeleteCampaignService {
  constructor(private readonly campaignRepository: ShopCampaignRepository) {}

  async execute(shopId: string, campaignId: string) {
    const existing = await this.campaignRepository.findByIdForShop(
      shopId,
      campaignId,
    );
    if (!existing) throw new NotFoundException('Campaign not found');
    if (!assertDeletableStatus(existing.moderationStatus)) {
      throw new BadRequestException('Approved campaigns cannot be deleted');
    }

    await this.campaignRepository.deleteCampaign(shopId, campaignId);
    return { id: campaignId };
  }
}
