import { eq, SQL } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';

import {
  businessAccountVerificationTable,
  BusinessVerificationStatusEnum,
  TBusinessAccountVerification,
  TNewBusinessAccountVerification,
} from '@/_db/drizzle/schema';
import { Injectable } from '@nestjs/common';
import { DrizzleTx } from '@/_db/drizzle/types';
import { and } from 'drizzle-orm';

export interface BusinessAccountVerificationQuery {
  id?: string;
  businessAccountId?: string;
  status?: (typeof BusinessVerificationStatusEnum.enumValues)[number];
}

@Injectable()
export class BusinessAccountVerificationRepository {
  constructor(private readonly db: DrizzleService) {}

  private buildWhere(options?: BusinessAccountVerificationQuery): SQL[] {
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

  async findOne(
    options?: BusinessAccountVerificationQuery,
    tx?: DrizzleTx,
  ): Promise<TBusinessAccountVerification | null> {
    const executor = this.db.getExecutor(tx);
    const where = this.buildWhere(options);
    const [row] = await executor
      .select()
      .from(businessAccountVerificationTable)
      .where(and(...where))
      .limit(1)
      .execute();
    return row ?? null;
  }

  async create(
    data: TNewBusinessAccountVerification,
    tx?: DrizzleTx,
  ): Promise<TBusinessAccountVerification> {
    const executor = this.db.getExecutor(tx);
    const [row] = await executor
      .insert(businessAccountVerificationTable)
      .values(data)
      .returning();
    return row;
  }

  async update(
    data: Partial<TNewBusinessAccountVerification>,
    options: BusinessAccountVerificationQuery,
    tx?: DrizzleTx,
  ): Promise<TBusinessAccountVerification[]> {
    const executor = this.db.getExecutor(tx);
    const where = this.buildWhere(options);
    return await executor
      .update(businessAccountVerificationTable)
      .set(data)
      .where(and(...where))
      .returning()
      .execute();
  }
}
