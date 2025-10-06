import { HttpStatus, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { CustomException } from '@/common/exceptions/custom.exception';
import { ErrorCode } from '@/common/modules/response/dto/error.schema';
import { DrizzleService } from '@/drizzle/drizzle.service';
import { adminTable } from '@/drizzle/schema';
import { DrizzlePgTransaction } from '@/drizzle/types';

@Injectable()
export class AdminService {
  constructor(private readonly drizzle: DrizzleService) {}

  async createAdmin(
    payload: {
      userName: string;
      firstName: string;
      lastName: string;
    },
    tx?: DrizzlePgTransaction,
  ) {
    const { userName } = payload;

    const db = tx || this.drizzle.client;

    const [existingAdmin] = await db
      .select()
      .from(adminTable)
      .where(eq(adminTable.userName, userName));

    if (existingAdmin) {
      throw new CustomException(
        `'${userName}' is already in use.`,
        HttpStatus.CONFLICT,
        ErrorCode.DUPLICATE_ENTRY,
      );
    }

    const [newAdmin] = await db
      .insert(adminTable)
      .values(payload)
      .returning()
      .execute();

    return newAdmin;
  }
}
