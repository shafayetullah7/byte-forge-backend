// src/graphql/common/pagination/pagination.input.ts
import { Field, InputType, Int } from '@nestjs/graphql';
import { z } from 'zod';

export const PaginationSchema = z.object({
  limit: z
    .number()
    .int()
    .min(1, { message: 'Limit must be at least 1' })
    .max(100, { message: 'Limit cannot exceed 100' })
    .default(10),

  offset: z
    .number()
    .int()
    .min(0, { message: 'Offset must be a non-negative integer' })
    .default(0),
});

export type PaginationInputType = z.infer<typeof PaginationSchema>;

@InputType()
export class PaginationInput implements PaginationInputType {
  @Field(() => Int, { nullable: true, defaultValue: 10 })
  limit!: number; // required after validation

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  offset!: number; // required after validation
}
