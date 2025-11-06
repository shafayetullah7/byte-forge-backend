import { TSession, TUser, TUserLocalAuth } from '@/_db/drizzle/schema';

export type AccessUserAuth = {
  user: TUser;
  userLocalAuth?: TUserLocalAuth;
  session?: TSession;
  role: 'user';
};
