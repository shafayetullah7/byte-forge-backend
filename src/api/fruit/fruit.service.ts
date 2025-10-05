import { Injectable } from '@nestjs/common';
import {
  eq,
  ilike,
  inArray,
  SQL,
  gt,
  gte,
  lt,
  lte,
  and,
  Column,
} from 'drizzle-orm';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import {
  fruits,
  FruitType,
  NewFruitType,
} from 'src/drizzle/schema/test/fruit.schema';
import { FruitFilterInput } from 'src/graphql/modules/fruit/inputs/fruit.filter.input';

@Injectable()
export class FruitService {
  constructor(private readonly drizzle: DrizzleService) {}

  private applyStringFilter(
    column: Column, // <-- typed instead of `any`
    filter?: FruitFilterInput['name'],
  ): SQL[] {
    if (!filter) return [];

    const conditions: SQL[] = [];
    if (filter.equals) conditions.push(eq(column, filter.equals));
    if (filter.contains) conditions.push(ilike(column, `%${filter.contains}%`));
    if (filter.startsWith)
      conditions.push(ilike(column, `${filter.startsWith}%`));
    if (filter.endsWith) conditions.push(ilike(column, `%${filter.endsWith}`));
    if (filter.in) conditions.push(inArray(column, filter.in));

    return conditions;
  }

  private applyNumberFilter(
    column: Column,
    filter?: FruitFilterInput['sweetness'],
  ): SQL[] {
    if (!filter) return [];

    const conditions: SQL[] = [];
    if (filter.equals !== undefined) conditions.push(eq(column, filter.equals));
    if (filter.in) conditions.push(inArray(column, filter.in));
    if (filter.lt !== undefined) conditions.push(lt(column, filter.lt));
    if (filter.lte !== undefined) conditions.push(lte(column, filter.lte));
    if (filter.gt !== undefined) conditions.push(gt(column, filter.gt));
    if (filter.gte !== undefined) conditions.push(gte(column, filter.gte));

    return conditions;
  }

  async getFruits(filter?: FruitFilterInput): Promise<FruitType[]> {
    const conditions: SQL[] = [];

    conditions.push(...this.applyStringFilter(fruits.name, filter?.name));
    conditions.push(...this.applyStringFilter(fruits.color, filter?.color));
    conditions.push(
      ...this.applyNumberFilter(fruits.sweetness, filter?.sweetness),
    );
    conditions.push(
      ...this.applyStringFilter(fruits.description, filter?.description),
    );

    const result = await this.drizzle.client
      .select()
      .from(fruits)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

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
