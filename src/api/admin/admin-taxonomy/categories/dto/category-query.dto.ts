import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PaginationParamsSchema } from '../../../../../common/schemas/pagination.schema';

const categoryQuerySchema = PaginationParamsSchema.extend({
  search: z.string().optional(),
  id: z.string().uuid().optional(),
  name: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name']).optional().default('createdAt'),
});

export class CategoryQueryDto extends createZodDto(categoryQuerySchema) {}
