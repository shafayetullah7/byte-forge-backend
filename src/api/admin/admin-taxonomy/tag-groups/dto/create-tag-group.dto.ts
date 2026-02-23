import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const createTagGroupSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').max(255),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export class CreateTagGroupDto extends createZodDto(createTagGroupSchema) {}
