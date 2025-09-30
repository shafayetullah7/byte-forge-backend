import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Fruit } from '../objects/fruit.object';
import { FruitService } from 'src/api/fruit/fruit.service';
import { CreateSingleFruitInput } from '../inputs/create.fruit.input';

@Resolver(() => Fruit)
export class FruitResolver {
  constructor(private readonly fruitService: FruitService) {}

  @Query(() => [Fruit], { name: 'fruits' })
  async findMany(): Promise<Fruit[]> {
    // ← Add return type
    const data = await this.fruitService.getFruits();

    return data;
  }

  @Mutation(() => Fruit)
  async createFruit(@Args('input') input: CreateSingleFruitInput) {
    const newFruit = await this.fruitService.createSingleFruit(input);
    return newFruit;
  }
}
