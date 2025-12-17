import { SQL, eq } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { BaseRepository } from '../../_base/base.repository';
import { shopContactTable } from '@/_db/drizzle/schema';
import { Injectable } from '@nestjs/common';

export interface ShopContactQuery {
  id?: string;
  shopId?: string;
  phone?: string;
  businessEmail?: string;
}

@Injectable()
export class ShopContactRepository extends BaseRepository<
  typeof shopContactTable,
  ShopContactQuery
> {
  constructor(db: DrizzleService) {
    super(db, shopContactTable);
  }

  protected buildWhere(options?: ShopContactQuery): SQL[] {
    if (!options) return [];

    const where: SQL[] = [];

    if (options.id) where.push(eq(shopContactTable.id, options.id));
    if (options.shopId) where.push(eq(shopContactTable.shopId, options.shopId));
    if (options.phone) where.push(eq(shopContactTable.phone, options.phone));
    if (options.businessEmail)
      where.push(eq(shopContactTable.businessEmail, options.businessEmail));

    return where;
  }
}
