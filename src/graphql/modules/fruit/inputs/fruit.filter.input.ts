import { Field, InputType } from '@nestjs/graphql';
import {
  IntFilter,
  IntFilterSchema,
} from 'src/graphql/common/filers/int.filter';
import {
  StringFilter,
  StringFilterSchema,
} from 'src/graphql/common/filers/string.filter';
import { z } from 'zod';

export const FruitFilterSchema = z
  .object({
    name: StringFilterSchema.optional(),
    color: StringFilterSchema.optional(),
    sweetness: IntFilterSchema.optional(),
    description: StringFilterSchema.optional(),
  })
  .partial();

export type FruitFilter = z.infer<typeof FruitFilterSchema>;

@InputType()
export class FruitFilterInput implements FruitFilter {
  @Field(() => StringFilter, { nullable: true })
  name?: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  color?: StringFilter;

  @Field(() => IntFilter, { nullable: true })
  sweetness?: IntFilter;

  @Field(() => StringFilter, { nullable: true })
  description?: StringFilter;
}
