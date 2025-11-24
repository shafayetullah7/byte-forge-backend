import { SQL, eq, gt, gte, lt, lte, isNull, not } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { BaseRepository } from '../_base/base.repository';
import { sessionTable } from '@/_db/drizzle/schema';
import { Injectable } from '@nestjs/common';

export interface SessionQuery {
  id?: string;
  revoked?: boolean;
  ip?: string;
  logoutAt?: {
    isNull?: boolean;
    gt?: Date;
    gte?: Date;
    lt?: Date;
    lte?: Date;
  };
  expiresAt?: {
    gt?: Date;
    gte?: Date;
    lt?: Date;
    lte?: Date;
  };
}

@Injectable()
export class SessionRepository extends BaseRepository<
  typeof sessionTable,
  SessionQuery
> {
  constructor(db: DrizzleService) {
    super(db, sessionTable);
  }

  protected buildWhere(options?: SessionQuery): SQL[] {
    if (!options) return [];

    const where: SQL[] = [];

    if (options.id) where.push(eq(sessionTable.id, options.id));
    if (options.revoked !== undefined)
      where.push(eq(sessionTable.revoked, options.revoked));
    if (options.ip) where.push(eq(sessionTable.ip, options.ip));

    // logoutAt filters
    if (options.logoutAt) {
      const l = options.logoutAt;
      if (l.isNull !== undefined) {
        where.push(
          l.isNull
            ? isNull(sessionTable.logoutAt)
            : not(isNull(sessionTable.logoutAt)),
        );
      }
      if (l.gt) where.push(gt(sessionTable.logoutAt, l.gt));
      if (l.gte) where.push(gte(sessionTable.logoutAt, l.gte));
      if (l.lt) where.push(lt(sessionTable.logoutAt, l.lt));
      if (l.lte) where.push(lte(sessionTable.logoutAt, l.lte));
    }

    // expiresAt filters
    if (options.expiresAt) {
      const e = options.expiresAt;
      if (e.gt) where.push(gt(sessionTable.expiresAt, e.gt));
      if (e.gte) where.push(gte(sessionTable.expiresAt, e.gte));
      if (e.lt) where.push(lt(sessionTable.expiresAt, e.lt));
      if (e.lte) where.push(lte(sessionTable.expiresAt, e.lte));
    }

    return where;
  }
}
