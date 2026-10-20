import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const searchSuggestQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(2, 'Query must be at least 2 characters')
    .max(100, 'Query must be at most 100 characters'),
  limit: z.coerce.number().int().min(1).max(20).optional().default(20),
});

export class SearchSuggestQueryDto extends createZodDto(searchSuggestQuerySchema) {}
