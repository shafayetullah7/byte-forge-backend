import { TAdmin, TAdminLocalAuth } from '@/drizzle/schema';

export type LocalAuthenticAdmin = {
  admin: TAdmin;
  adminLocalAuth: TAdminLocalAuth;
};
