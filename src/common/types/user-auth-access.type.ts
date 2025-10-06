import { TSession, TUser, TUserLocalAuth } from '@/drizzle/schema';

export type AccessUserAuth = {
  user: TUser;
  userLocalAuth?: TUserLocalAuth;
  session?: TSession;
  role: 'user';
};
