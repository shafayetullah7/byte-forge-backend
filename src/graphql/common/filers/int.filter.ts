import { Field, InputType, Int } from '@nestjs/graphql';
import { z } from 'zod';

@InputType()
export class IntFilter {
  @Field(() => Int, { nullable: true })
  equals?: number;

  @Field(() => [Int], { nullable: true })
  in?: number[];

  @Field({ nullable: true })
  lt?: number;

  @Field({ nullable: true })
  gt?: number;

  @Field({ nullable: true })
  lte?: number;

  @Field({ nullable: true })
  gte?: number;
}

export const IntFilterSchema = z
  .object({
    equals: z.number().optional(),
    in: z.array(z.number()).optional(),
    lt: z.number().optional(),
    lte: z.number().optional(),
    gt: z.number().optional(),
    gte: z.number().optional(),
  })
  .partial();
