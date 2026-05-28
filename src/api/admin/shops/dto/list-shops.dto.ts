import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ShopStatusEnum } from '../../../../_db/drizzle/enum';
import { PaginationParamsSchema } from '@/common/schemas/pagination.schema';

const listShopsSchema = PaginationParamsSchema.extend({
  status: z.nativeEnum(ShopStatusEnum).optional(),
  division: z.string().optional(),
});

export class ListShopsDto extends createZodDto(listShopsSchema) {}
