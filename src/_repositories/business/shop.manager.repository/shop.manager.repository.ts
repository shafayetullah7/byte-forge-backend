import { SQL, eq } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { BaseRepository } from '../../_base/base.repository';
import { shopManagerTable } from '@/_db/drizzle/schema';
import { Injectable } from '@nestjs/common';

export interface ShopManagerQuery {
  id?: string;
  shopId?: string;
  managerId?: string;
  isPrimary?: boolean;
}

@Injectable()
export class ShopManagerRepository extends BaseRepository<
  typeof shopManagerTable,
  ShopManagerQuery
> {
  constructor(db: DrizzleService) {
    super(db, shopManagerTable);
  }

  protected buildWhere(options?: ShopManagerQuery): SQL[] {
    if (!options) return [];

    const where: SQL[] = [];

    if (options.id) where.push(eq(shopManagerTable.id, options.id));
    if (options.shopId) where.push(eq(shopManagerTable.shopId, options.shopId));
    if (options.managerId)
      where.push(eq(shopManagerTable.managerId, options.managerId));
    if (options.isPrimary !== undefined)
      where.push(eq(shopManagerTable.isPrimary, options.isPrimary));

    return where;
  }
}
