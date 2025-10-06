import { TSession, TUser } from '@/drizzle/schema';

export type AuthenticUser = {
  user: TUser;
  session: TSession;
};
