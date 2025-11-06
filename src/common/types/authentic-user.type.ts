import { TSession, TUser } from '@/_db/drizzle/schema';

export type AuthenticUser = {
  user: TUser;
  session: TSession;
};
