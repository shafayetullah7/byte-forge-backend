import { ShopVerificationStatusEnum } from '@/_db/drizzle/enum';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const verifyShopSchema = z
  .object({
    status: z.enum([
      ShopVerificationStatusEnum.APPROVED,
      ShopVerificationStatusEnum.REJECTED,
    ]),
    reason: z.string().optional(),
    adminNotes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.status === ShopVerificationStatusEnum.REJECTED && !data.reason) {
        return false;
      }
      return true;
    },
    {
      message: 'Rejection reason is required when rejecting a shop',
      path: ['reason'],
    },
  );

export class VerifyShopDto extends createZodDto(verifyShopSchema) {}
