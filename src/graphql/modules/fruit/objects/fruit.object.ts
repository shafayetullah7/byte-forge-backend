import { Field, Int, ObjectType } from '@nestjs/graphql';
import { FruitType } from '@/drizzle/schema/test/fruit.schema';
import { BaseEntity } from '@/graphql/common/base/base.entity';

@ObjectType()
export class Fruit extends BaseEntity implements FruitType {
  @Field()
  name: string;

  @Field()
  color: string;

  @Field(() => Int, { nullable: true })
  sweetness: number | null;

  @Field()
  description: string;
}
