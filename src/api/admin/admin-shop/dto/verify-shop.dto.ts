import { ShopVerificationStatusEnum } from '@/_db/drizzle/enum';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const verifyShopSchema = z.object({
  status: z.enum([
    ShopVerificationStatusEnum.APPROVED,
    ShopVerificationStatusEnum.REJECTED,
  ]),
  reason: z.string().optional(),
});

export class VerifyShopDto extends createZodDto(verifyShopSchema) {}
