import { Inject, Injectable } from '@nestjs/common';
import { DrizzleClient } from './types';
import { DRIZZLE } from './types/drizzle.token';
import { PgTransaction } from 'drizzle-orm/pg-core';

@Injectable()
export class DrizzleService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleClient,
  ) {}

  get client() {
    return this.db;
  }

  async transaction<T>(
    callback: (tx: PgTransaction<any, any, any>) => Promise<T>,
  ): Promise<T> {
    return await this.db.transaction(async (tx) => {
      try {
        const result = await callback(tx);
        return result;
      } catch (error) {
        console.error('Transaction failed:', error);
        throw error; // rollback is automatic on throw
      }
    });
  }
}
