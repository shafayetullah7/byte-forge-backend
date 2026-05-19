import { DrizzleTx } from '@/_db/drizzle/types';

export type TLockTransaction = { tx: DrizzleTx; lock?: boolean };
