import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { userTable } from '@/_db/drizzle/schema';
import { DrizzlePgTransaction } from '@/_db/drizzle/types';

@Injectable()
export class UserService {
  constructor(private readonly drizzle: DrizzleService) {}

  async createUser(
    payload: {
      userName: string;
      firstName: string;
      lastName: string;
    },
    tx?: DrizzlePgTransaction,
  ) {
    const db = tx || this.drizzle.client;

    const [user] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.userName, payload.userName))
      .execute();

    if (user) {
      throw new ConflictException('username already exists');
    }

    const [newUser] = await db
      .insert(userTable)
      .values({
        firstName: payload.firstName,
        lastName: payload.lastName,
        userName: payload.userName,
      })
      .returning()
      .execute();

    if (!newUser) {
      throw new InternalServerErrorException('Failed to create user');
    }

    return newUser;
  }

  async getUser(userId: string) {
    const [user] = await this.drizzle.client
      .select({
        user: {
          ...userTable,
        },
      })
      .from(userTable)
      .where(eq(userTable.id, userId))
      .execute();

    if (!user) throw new NotFoundException('User not found');

    return user;
  }
}
