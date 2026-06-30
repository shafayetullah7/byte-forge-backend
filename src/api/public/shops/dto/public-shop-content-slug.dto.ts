import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { publicShopSlugSchema } from './public-shop-slug.dto';
import { SlugSchema } from '@/common/schemas/slug.schema';

export const publicShopCampaignSlugSchema = publicShopSlugSchema.extend({
  campaignSlug: SlugSchema,
});

export class PublicShopCampaignSlugDto extends createZodDto(
  publicShopCampaignSlugSchema,
) {}

export const publicShopArticleSlugSchema = publicShopSlugSchema.extend({
  articleSlug: SlugSchema,
});

export class PublicShopArticleSlugDto extends createZodDto(
  publicShopArticleSlugSchema,
) {}
