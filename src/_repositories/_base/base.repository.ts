import { SQL, and, sql } from 'drizzle-orm';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { DrizzleTx } from '@/_db/drizzle/types';
import { AnyPgTable } from 'drizzle-orm/pg-core';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';

type TxWrapper = { tx: DrizzleTx; lock?: boolean };

export abstract class BaseRepository<
  TTable extends AnyPgTable,
  TQueryOption = unknown, // Keep this abstract for child classes to define
> {
  // Infer the record types from the table schema
  public readonly TRecord: InferSelectModel<TTable>;
  public readonly TNewRecord: InferInsertModel<TTable>;

  constructor(
    protected readonly db: DrizzleService,
    protected readonly table: TTable,
  ) {}

  protected executor(tx?: DrizzleTx) {
    return tx ?? this.db.client;
  }

  protected abstract buildWhere(options?: TQueryOption): SQL[];

  async findMany(options?: {
    queryOptions?: TQueryOption;
    limit?: number;
    offset?: number;
    transaction?: TxWrapper;
  }): Promise<TTable['$inferInsert']> {
    const { queryOptions, limit, offset, transaction } = options ?? {};
    const exec = this.executor(transaction?.tx);

    const conditions = this.buildWhere(queryOptions);

    const baseQuery = exec.select().from(this.table as AnyPgTable);

    const withConditions = conditions.length
      ? baseQuery.where(and(...conditions))
      : baseQuery;

    const withLimit = limit ? withConditions.limit(limit) : withConditions;

    const withOffset = offset ? withLimit.offset(offset) : withLimit;

    const finalQuery = transaction?.lock
      ? withOffset.for('update')
      : withOffset;

    return await finalQuery.execute();
  }

  async findOne(
    queryOptions?: TQueryOption,
    transaction?: TxWrapper,
  ): Promise<TTable['$inferInsert'] | null> {
    const exec = this.executor(transaction?.tx);

    const conditions = this.buildWhere(queryOptions);

    const baseQuery = exec
      .select()
      .from(this.table as AnyPgTable)
      .limit(1);

    const withConditions = conditions.length
      ? baseQuery.where(and(...conditions))
      : baseQuery;
    const finalQuery = transaction?.lock
      ? withConditions.for('update')
      : withConditions;

    const [row] = await finalQuery.execute();
    return row ?? null;
  }

  async create(
    data: InferInsertModel<TTable>,
    transaction?: TxWrapper,
  ): Promise<TTable['$inferSelect']> {
    const exec = this.executor(transaction?.tx);

    const [row] = await exec.insert(this.table).values(data).returning();

    return row;
  }

  async update(
    data: Partial<TTable['$inferInsert']>,
    queryOptions: TQueryOption,
    transaction?: TxWrapper,
  ): Promise<TTable['$inferSelect'][]> {
    const exec = this.executor(transaction?.tx);

    const conditions = this.buildWhere(queryOptions);

    // Start the builder
    const baseQuery = exec.update(this.table).set(data);

    const withConditions = conditions.length
      ? baseQuery.where(and(...conditions))
      : baseQuery;

    const result = await withConditions.returning().execute();

    if (!Array.isArray(result)) {
      return [];
    }

    return result;
  }

  async delete(where: SQL, transaction?: TxWrapper): Promise<boolean> {
    const exec = this.executor(transaction?.tx);

    const deleted = await exec.delete(this.table).where(where).returning();

    return deleted.length > 0;
  }

  // Optional: Add count method
  async count(
    queryOptions?: TQueryOption,
    transaction?: TxWrapper,
  ): Promise<number> {
    const exec = this.executor(transaction?.tx);

    const conditions = this.buildWhere(queryOptions);

    // 1. Start building
    const baseQuery = exec
      .select({ count: sql<number>`count(*)` })
      .from(this.table as AnyPgTable);

    const withConditions = conditions.length
      ? baseQuery.where(and(...conditions))
      : baseQuery;
    // 3. Execute
    const [row] = await withConditions.execute();

    return Number(row.count);
  }
}
