// src/graphql/inputs/create-fruit.input.ts
import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateSingleFruitInput {
  @Field()
  name: string;

  @Field()
  color: string;

  @Field(() => Int, { nullable: true })
  sweetness?: number | null;

  @Field()
  description: string;
}

// src/graphql/schemas/create-fruit.schema.ts
import { z } from 'zod';

export const CreateFruitSchema = z.object({
  name: z
    .string({ required_error: 'Name must be string' })
    .min(2, { message: 'Name must be between 2 and 50 characters' })
    .max(10, { message: 'Name must be between 2 and 50 characters' }),

  color: z
    .string({ required_error: 'Color must be a string' })
    .min(2, { message: 'Color must be between 2 and 30 characters' })
    .max(30, { message: 'Color must be between 2 and 30 characters' }),

  sweetness: z
    .number({ invalid_type_error: 'Sweetness must be an integer' })
    .int({ message: 'Sweetness must be an integer' })
    .min(0, { message: 'Sweetness must be at least 0' })
    .max(100, { message: 'Sweetness must be at most 100' })
    .optional()
    .nullable(), // matches your nullable GraphQL field

  description: z
    .string({ required_error: 'Description must be a string' })
    .min(5, { message: 'Description must be between 5 and 500 characters' })
    .max(500, { message: 'Description must be between 5 and 500 characters' }),
});

export type CreateFruitInput = z.infer<typeof CreateFruitSchema>;
