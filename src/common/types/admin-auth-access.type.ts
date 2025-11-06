import { TAdmin, TAdminLocalAuth, TSession } from '@/_db/drizzle/schema';

export type AccessAdminAuth = {
  admin: TAdmin;
  adminLocalAuth?: TAdminLocalAuth;
  session?: TSession;
  role: 'admin';
};
