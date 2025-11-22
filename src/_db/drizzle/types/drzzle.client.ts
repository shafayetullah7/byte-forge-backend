import {
  NodePgDatabase,
  NodePgQueryResultHKT,
} from 'drizzle-orm/node-postgres';
import * as schema from '../schema';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { ExtractTablesWithRelations } from 'drizzle-orm';

export type DrizzleClient = NodePgDatabase<typeof schema>;
export type DrizzleTx = PgTransaction<
  NodePgQueryResultHKT,
  typeof import('/home/shafayat/Desktop/ByteForge/authentication/src/_db/drizzle/schema/index'),
  ExtractTablesWithRelations<
    typeof import('/home/shafayat/Desktop/ByteForge/authentication/src/_db/drizzle/schema/index')
  >
>;
