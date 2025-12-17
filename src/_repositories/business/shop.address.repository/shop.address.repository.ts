import { SQL, eq } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { BaseRepository } from '../../_base/base.repository';
import { shopAddressTable } from '@/_db/drizzle/schema';
import { Injectable } from '@nestjs/common';

export interface ShopAddressQuery {
  id?: string;
  shopId?: string;
  country?: string;
  district?: string;
  division?: string;
  isVerified?: boolean;
}

@Injectable()
export class ShopAddressRepository extends BaseRepository<
  typeof shopAddressTable,
  ShopAddressQuery
> {
  constructor(db: DrizzleService) {
    super(db, shopAddressTable);
  }

  protected buildWhere(q?: ShopAddressQuery): SQL[] {
    if (!q) return [];

    const where: SQL[] = [];

    if (q.id) where.push(eq(shopAddressTable.id, q.id));
    if (q.shopId) where.push(eq(shopAddressTable.shopId, q.shopId));
    if (q.country) where.push(eq(shopAddressTable.country, q.country));
    if (q.division) where.push(eq(shopAddressTable.division, q.division));
    if (q.district) where.push(eq(shopAddressTable.district, q.district));
    if (q.isVerified !== undefined)
      where.push(eq(shopAddressTable.isVerified, q.isVerified));

    return where;
  }
}
