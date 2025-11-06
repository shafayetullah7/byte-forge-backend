import { TAdmin, TAdminLocalAuth } from '@/_db/drizzle/schema';

export type AdminAuth = { admin: TAdmin; adminLocalAuth: TAdminLocalAuth };
