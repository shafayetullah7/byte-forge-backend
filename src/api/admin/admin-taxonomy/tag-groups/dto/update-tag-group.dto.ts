import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const updateTagGroupSchema = z.object({
  slug: z.string().trim().min(1, 'Group slug cannot be empty').max(255).optional(),
  isActive: z.boolean().optional(),
});

export class UpdateTagGroupDto extends createZodDto(updateTagGroupSchema) {}
