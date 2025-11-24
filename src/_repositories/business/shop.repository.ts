import { SQL, eq } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { BaseRepository } from '../_base/base.repository';
import { shopTable } from '@/_db/drizzle/schema';
import { Injectable } from '@nestjs/common';

export interface ShopQuery {
  id?: string;
  userId?: string;
  shopName?: string;
  businessType?: string;
}

@Injectable()
export class ShopRepository extends BaseRepository<
  typeof shopTable,
  ShopQuery
> {
  constructor(db: DrizzleService) {
    super(db, shopTable);
  }

  protected buildWhere(options?: ShopQuery): SQL[] {
    if (!options) return [];

    const where: SQL[] = [];

    if (options.id) where.push(eq(shopTable.id, options.id));
    if (options.userId) where.push(eq(shopTable.userId, options.userId));
    if (options.shopName) where.push(eq(shopTable.shopName, options.shopName));
    if (options.businessType)
      where.push(eq(shopTable.businessType, options.businessType));

    return where;
  }
}
