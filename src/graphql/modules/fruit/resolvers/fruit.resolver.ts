import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Fruit } from '../objects/fruit.object';
import { FruitService } from 'src/api/fruit/fruit.service';
import {
  CreateFruitSchema,
  CreateSingleFruitInput,
} from '../inputs/create.fruit.input';
import {
  FruitFilterInput,
  FruitFilterSchema,
} from '../inputs/fruit.filter.input';
import { ZodGQLValidationPipe } from 'src/common/pipes/zod.gql.validation.pipe';

@Resolver(() => Fruit)
export class FruitResolver {
  constructor(private readonly fruitService: FruitService) {}

  @Query(() => [Fruit], { name: 'fruits' })
  async findMany(
    @Args(
      'filter',
      { nullable: true },
      new ZodGQLValidationPipe(FruitFilterSchema),
    )
    filter?: FruitFilterInput,
  ): Promise<Fruit[]> {
    console.log(filter);
    // ← Add return type
    const data = await this.fruitService.getFruits(filter);

    return data;
  }

  @Mutation(() => Fruit)
  async createFruit(
    @Args('input', new ZodGQLValidationPipe(CreateFruitSchema))
    input: CreateSingleFruitInput,
  ) {
    const newFruit = await this.fruitService.createSingleFruit(input);
    return newFruit;
  }
}
