import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const tagParamSchema = z.object({
  id: z.union([
    z.string().uuid(),
    z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  ], { message: 'Must be a valid UUID or slug format' }),
});

export class TagParamDto extends createZodDto(tagParamSchema) {}
