import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ShopStatusEnum, ShopVerificationStatusEnum } from '@/_db/drizzle/enum';
import { PaginationParamsSchema } from '@/common/schemas/pagination.schema';

const shopQuerySchema = PaginationParamsSchema.extend({
  status: z.nativeEnum(ShopStatusEnum).optional(),
  verificationStatus: z.nativeEnum(ShopVerificationStatusEnum).optional(),
});

export class ShopQueryDto extends createZodDto(shopQuerySchema) {}
