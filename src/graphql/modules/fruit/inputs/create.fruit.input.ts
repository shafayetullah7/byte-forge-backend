// src/graphql/inputs/create-fruit.input.ts
import { Field, InputType, Int } from '@nestjs/graphql';
import { z } from 'zod';

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

export const CreateFruitSchema = z.object({
  name: z
    .string({
      // Use 'error' for all required/type issues
      error: 'Name must be a string',
    })
    .min(2, { message: 'Name must be between 2 and 50 characters' })
    .max(10, { message: 'Name must be between 2 and 50 characters' }),

  color: z
    .string({
      error: 'Color must be a string',
    })
    .min(2, { message: 'Color must be between 2 and 30 characters' })
    .max(30, { message: 'Color must be between 2 and 30 characters' }),

  sweetness: z
    .number({
      // Use an error function to differentiate between missing/invalid types
      error: (issue) => {
        if (issue.input === undefined) {
          return 'Sweetness is required'; // Although 'optional().nullable()', this would catch a required 'undefined' in the object
        }
        return 'Sweetness must be an integer'; // Catches non-number types like a string "ten"
      },
    })
    .int({ message: 'Sweetness must be an integer' })
    .min(0, { message: 'Sweetness must be at least 0' })
    .max(100, { message: 'Sweetness must be at most 100' })
    .optional()
    .nullable(),

  description: z
    .string({
      error: 'Description must be a string',
    })
    .min(5, { message: 'Description must be between 5 and 500 characters' })
    .max(500, { message: 'Description must be between 5 and 500 characters' }),
});

export type CreateFruitInput = z.infer<typeof CreateFruitSchema>;
