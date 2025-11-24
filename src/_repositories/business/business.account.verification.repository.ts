import { eq, SQL } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';

import {
  businessAccountVerificationTable,
  BusinessVerificationStatusEnum,
} from '@/_db/drizzle/schema';
import { BaseRepository } from '../_base/base.repository';
import { Injectable } from '@nestjs/common';

export interface BusinessAccountVerificationQuery {
  id?: string;
  businessAccountId?: string;
  status?: (typeof BusinessVerificationStatusEnum.enumValues)[number];
}

@Injectable()
export class BusinessAccountVerificationRepository extends BaseRepository<
  typeof businessAccountVerificationTable,
  BusinessAccountVerificationQuery
> {
  constructor(protected readonly db: DrizzleService) {
    super(db, businessAccountVerificationTable);
  }

  protected buildWhere(options?: BusinessAccountVerificationQuery): SQL[] {
    if (!options) return [];

    const conditions: SQL[] = [];
    const { id, businessAccountId, status } = options;

    if (id) {
      conditions.push(eq(businessAccountVerificationTable.id, id));
    }

    if (businessAccountId) {
      conditions.push(
        eq(
          businessAccountVerificationTable.businessAccountId,
          businessAccountId,
        ),
      );
    }

    if (status) {
      conditions.push(eq(businessAccountVerificationTable.status, status));
    }

    return conditions;
  }
}
