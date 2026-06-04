import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { UUIDSchema } from '../../cart/dto/add-to-cart.dto';

export const CalculatePriceBreakdownQuerySchema = z.object({
  districtId: UUIDSchema.describe('District ID for shipping rate calculation'),
});

export class CalculatePriceBreakdownQueryDto extends createZodDto(CalculatePriceBreakdownQuerySchema) {}
