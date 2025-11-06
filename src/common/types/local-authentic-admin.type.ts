import { TAdmin, TAdminLocalAuth } from '@/_db/drizzle/schema';

export type LocalAuthenticAdmin = {
  admin: TAdmin;
  adminLocalAuth: TAdminLocalAuth;
};
