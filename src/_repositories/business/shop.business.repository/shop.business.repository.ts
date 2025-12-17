import { SQL, eq } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { BaseRepository } from '../../_base/base.repository';
import { shopBusinessTable } from '@/_db/drizzle/schema';
import { Injectable } from '@nestjs/common';

export interface ShopBusinessQuery {
  id?: string;
  shopId?: string;
  localDelivery?: boolean;
  nationwideShipping?: boolean;
  inStorePickup?: boolean;
  internationalShipping?: boolean;
}

@Injectable()
export class ShopBusinessRepository extends BaseRepository<
  typeof shopBusinessTable,
  ShopBusinessQuery
> {
  constructor(db: DrizzleService) {
    super(db, shopBusinessTable);
  }

  protected buildWhere(options?: ShopBusinessQuery): SQL[] {
    if (!options) return [];

    const where: SQL[] = [];

    if (options.id) where.push(eq(shopBusinessTable.id, options.id));
    if (options.shopId)
      where.push(eq(shopBusinessTable.shopId, options.shopId));
    if (options.localDelivery !== undefined)
      where.push(eq(shopBusinessTable.localDelivery, options.localDelivery));
    if (options.nationwideShipping !== undefined)
      where.push(
        eq(shopBusinessTable.nationwideShipping, options.nationwideShipping),
      );
    if (options.inStorePickup !== undefined)
      where.push(eq(shopBusinessTable.inStorePickup, options.inStorePickup));
    if (options.internationalShipping !== undefined)
      where.push(
        eq(
          shopBusinessTable.internationalShipping,
          options.internationalShipping,
        ),
      );

    return where;
  }
}
