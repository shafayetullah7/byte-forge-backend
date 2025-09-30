import { Field, InputType, Int } from '@nestjs/graphql';
import { NewFruitType } from 'src/drizzle/schema';

@InputType()
export class CreateSingleFruitInput implements NewFruitType {
  @Field()
  name: string;

  @Field()
  color: string;

  @Field(() => Int, { nullable: true })
  sweetness: number;

  @Field()
  description: string;
}
