import { ZodDtoFactory } from '@/common/factories/zod.dto.factory';
import { z } from 'zod';

const localLoginSchema = z.object({
  email: z
    .email({ message: 'Please provide a valid email address' })
    .max(255, { message: 'Email must not exceed 255 characters' }),

  password: z
    .string({
      // Unified generic error for both missing/invalid type issues
      error: 'Invalid password input provided',
    })
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(255, { message: 'Password must not exceed 255 characters' }),
});

export class LocalLoginDto extends ZodDtoFactory.create(localLoginSchema) {}
