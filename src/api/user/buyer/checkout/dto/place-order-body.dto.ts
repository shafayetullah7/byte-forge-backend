import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { UUIDSchema } from '../../cart/dto/add-to-cart.dto';

export const PlaceOrderBodySchema = z.object({
  addressId: UUIDSchema.describe('Shipping address ID'),
  itemIds: z
    .array(UUIDSchema)
    .min(1, 'At least one item must be selected'),
  paymentMethod: z.enum(['COD', 'CARD', 'BKASH', 'NAGAD', 'SSLCOMMERCE']).default('COD'),
  notes: z.string().max(1000).optional(),
});

export class PlaceOrderBodyDto extends createZodDto(PlaceOrderBodySchema) {}
