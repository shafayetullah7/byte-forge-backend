import { Field, InputType } from '@nestjs/graphql';
import { z } from 'zod';

@InputType()
export class StringFilter {
  @Field({ nullable: true })
  equals?: string;

  @Field({ nullable: true })
  contains?: string;

  @Field({ nullable: true })
  startsWith?: string;

  @Field({ nullable: true })
  endsWith?: string;

  @Field(() => [String], { nullable: true })
  in?: string[];
}

export const StringFilterSchema = z
  .object({
    equals: z.string().optional(),
    contains: z.string().optional(),
    startsWith: z.string().optional(),
    endsWith: z.string().optional(),
    in: z.array(z.string()).optional(),
  })
  .partial();
