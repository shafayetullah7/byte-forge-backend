import { TAdmin, TAdminLocalAuth, TSession } from '@/drizzle/schema';

export type AccessAdminAuth = {
  admin: TAdmin;
  adminLocalAuth?: TAdminLocalAuth;
  session?: TSession;
  role: 'admin';
};
