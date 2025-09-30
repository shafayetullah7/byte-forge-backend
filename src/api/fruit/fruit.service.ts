import { Injectable } from '@nestjs/common';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import {
  fruits,
  FruitType,
  NewFruitType,
} from 'src/drizzle/schema/test/fruit.schema';

@Injectable()
export class FruitService {
  constructor(private readonly drizzle: DrizzleService) {}

  async getFruits() {
    const result = await this.drizzle.client.select().from(fruits);

    return result;
  }

  async createSingleFruit(payload: NewFruitType): Promise<FruitType> {
    const result = await this.drizzle.client
      .insert(fruits)
      .values(payload)
      .returning();
    return result[0];
  }
}
