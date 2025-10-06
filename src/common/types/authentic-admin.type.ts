import { TAdmin, TSession } from '@/drizzle/schema';

export type AuthenticAdmin = {
  admin: TAdmin;
  session: TSession;
};
