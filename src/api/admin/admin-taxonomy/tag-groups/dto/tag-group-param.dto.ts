import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const tagGroupParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid UUID format for ID parameter' }),
});

export class TagGroupParamDto extends createZodDto(tagGroupParamSchema) {}
