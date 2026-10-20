import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const listCampaignsFeedQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(48).optional().default(24),
});

export class ListCampaignsFeedQueryDto extends createZodDto(
  listCampaignsFeedQuerySchema,
) {}
