import { businessAccountTable } from '@/_db/drizzle/schema';
import { BaseRepository } from '@/_repositories/_base/base.repository';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { eq, SQL } from 'drizzle-orm';
import { Injectable } from '@nestjs/common';

export interface BusinessAccountQuery {
  id?: string;
  ownerId?: string;
  name?: string;
}

@Injectable()
export class BusinessAccountRepository extends BaseRepository<
  typeof businessAccountTable,
  BusinessAccountQuery
> {
  constructor(protected readonly db: DrizzleService) {
    super(db, businessAccountTable);
  }

  protected buildWhere(options?: BusinessAccountQuery): SQL[] {
    if (!options) return [];

    const conditions: SQL[] = [];
    const { id, ownerId, name } = options;

    if (id) conditions.push(eq(businessAccountTable.id, id));
    if (ownerId) conditions.push(eq(businessAccountTable.ownerId, ownerId));
    if (name) conditions.push(eq(businessAccountTable.name, name));

    return conditions;
  }
}
