import { SQL, eq } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { BaseRepository } from '../_base/base.repository';
import { shopSocialMediaTable } from '@/_db/drizzle/schema';
import { Injectable } from '@nestjs/common';

export interface ShopSocialMediaQuery {
  id?: string;
  shopId?: string;
  facebook?: string;
  instagram?: string;
  x?: string;
}

@Injectable()
export class ShopSocialMediaRepository extends BaseRepository<
  typeof shopSocialMediaTable,
  ShopSocialMediaQuery
> {
  constructor(db: DrizzleService) {
    super(db, shopSocialMediaTable);
  }

  protected buildWhere(options?: ShopSocialMediaQuery): SQL[] {
    if (!options) return [];

    const where: SQL[] = [];

    if (options.id) where.push(eq(shopSocialMediaTable.id, options.id));
    if (options.shopId)
      where.push(eq(shopSocialMediaTable.shopId, options.shopId));
    if (options.facebook)
      where.push(eq(shopSocialMediaTable.facebook, options.facebook));
    if (options.instagram)
      where.push(eq(shopSocialMediaTable.instagram, options.instagram));
    if (options.x) where.push(eq(shopSocialMediaTable.x, options.x));

    return where;
  }
}
