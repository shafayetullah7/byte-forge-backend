import { ZodDtoFactory } from 'src/common/factories/zod.dto.factory';
import { z } from 'zod';

const localLoginSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a valid string',
    })
    .email({ message: 'Please provide a valid email address' })
    .max(255, { message: 'Email must not exceed 255 characters' }),

  password: z
    .string({
      required_error: 'Password is required',
      invalid_type_error: 'Password must be a valid string',
    })
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(255, { message: 'Password must not exceed 255 characters' }),
});

export class LocalLoginDto extends ZodDtoFactory.create(localLoginSchema) {}
