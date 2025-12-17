import { SQL, eq } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';

import { BaseRepository } from '../../_base/base.repository';
import {
  ShopVerificationStatusEnum,
  shopVerificationTable,
} from '@/_db/drizzle/schema';
import { Injectable } from '@nestjs/common';

export interface ShopVerificationQuery {
  id?: string;
  shopId?: string;
  status?: (typeof ShopVerificationStatusEnum.enumValues)[number];
}

@Injectable()
export class ShopVerificationRepository extends BaseRepository<
  typeof shopVerificationTable,
  ShopVerificationQuery
> {
  constructor(db: DrizzleService) {
    super(db, shopVerificationTable);
  }

  protected buildWhere(options?: ShopVerificationQuery): SQL[] {
    if (!options) return [];

    const where: SQL[] = [];

    if (options.id) where.push(eq(shopVerificationTable.id, options.id));
    if (options.shopId)
      where.push(eq(shopVerificationTable.shopId, options.shopId));
    if (options.status)
      where.push(eq(shopVerificationTable.status, options.status));

    return where;
  }
}
