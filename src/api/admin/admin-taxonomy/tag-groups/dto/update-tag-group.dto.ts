import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const updateTagGroupSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').max(255).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export class UpdateTagGroupDto extends createZodDto(updateTagGroupSchema) {}
