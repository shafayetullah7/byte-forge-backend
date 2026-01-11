import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const verifyEmailSchema = z.object({
  otp: z
    .string()
    .length(6, { message: 'OTP must be exactly 6 digits' })
    .regex(/^\d+$/, { message: 'OTP must contain only digits' }),
});

export class VerifyEmailDto extends createZodDto(verifyEmailSchema) {}
