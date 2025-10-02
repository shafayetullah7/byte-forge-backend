import { Injectable } from '@nestjs/common';
import { eq, ilike, inArray, SQL, gt, gte, lt, lte, and } from 'drizzle-orm';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import {
  fruits,
  FruitType,
  NewFruitType,
} from 'src/drizzle/schema/test/fruit.schema';
import { FruitFilter } from 'src/graphql/modules/fruit/inputs/fruit.filter.input';

@Injectable()
export class FruitService {
  constructor(private readonly drizzle: DrizzleService) {}

  async getFruits(filter?: FruitFilter) {
    const conditions: SQL[] = [];

    if (filter?.name) {
      const { contains, endsWith, equals, startsWith, in: IN } = filter.name;
      if (equals) conditions.push(eq(fruits.name, equals));
      if (contains) conditions.push(ilike(fruits.name, `%${contains}%`));
      if (startsWith) conditions.push(ilike(fruits.name, `${startsWith}%`));
      if (endsWith) conditions.push(ilike(fruits.name, `%${endsWith}`));
      if (IN?.length) conditions.push(inArray(fruits.name, IN));
    }

    if (filter?.color) {
      const { contains, endsWith, equals, startsWith, in: IN } = filter.color;
      if (equals) conditions.push(eq(fruits.color, equals));
      if (contains) conditions.push(ilike(fruits.color, `%${contains}%`));
      if (startsWith) conditions.push(ilike(fruits.color, `${startsWith}%`));
      if (endsWith) conditions.push(ilike(fruits.color, `%${endsWith}`));
      if (IN?.length) conditions.push(inArray(fruits.color, IN));
    }

    if (filter?.description) {
      const {
        contains,
        endsWith,
        equals,
        startsWith,
        in: IN,
      } = filter.description;
      if (equals) conditions.push(eq(fruits.description, equals));
      if (contains) conditions.push(ilike(fruits.description, `%${contains}%`));
      if (startsWith)
        conditions.push(ilike(fruits.description, `${startsWith}%`));
      if (endsWith) conditions.push(ilike(fruits.description, `%${endsWith}`));
      if (IN?.length) conditions.push(inArray(fruits.description, IN));
    }

    if (filter?.sweetness) {
      const { sweetness } = filter;
      if (sweetness?.equals !== undefined)
        conditions.push(eq(fruits.sweetness, sweetness.equals));
      if (sweetness?.gt !== undefined)
        conditions.push(gt(fruits.sweetness, sweetness.gt));
      if (sweetness?.gte !== undefined)
        conditions.push(gte(fruits.sweetness, sweetness.gte));
      if (sweetness?.lt !== undefined)
        conditions.push(lt(fruits.sweetness, sweetness.lt));
      if (sweetness?.lte !== undefined)
        conditions.push(lte(fruits.sweetness, sweetness.lte));
    }

    const result = await this.drizzle.client
      .select()
      .from(fruits)
      .where(conditions.length ? and(...conditions) : undefined);

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
