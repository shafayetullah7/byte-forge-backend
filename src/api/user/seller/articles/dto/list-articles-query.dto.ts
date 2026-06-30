import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PaginationParamsSchema } from '@/common/schemas/pagination.schema';
import { ShopContentModerationStatusEnum } from '@/_db/drizzle/enum';

export const listArticlesQuerySchema = PaginationParamsSchema.extend({
  moderationStatus: z.nativeEnum(ShopContentModerationStatusEnum).optional(),
});

export class ListArticlesQueryDto extends createZodDto(
  listArticlesQuerySchema,
) {}

export const articleIdParamSchema = z.object({
  id: z.string().uuid(),
});

export class ArticleIdParamDto extends createZodDto(articleIdParamSchema) {}
