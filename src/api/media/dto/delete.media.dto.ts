import { ZodDtoFactory } from '@/common/factories/zod.dto.factory';
import { z } from 'zod';

const deleteMediaSchema = z.object({
  id: z.uuid(),
});

export class DeleteMediaDto extends ZodDtoFactory.create(deleteMediaSchema) {}
