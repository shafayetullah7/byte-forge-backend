import { TUser, TUserLocalAuth } from '@/_db/drizzle/schema';

export type TLocalAuthenticUser = {
  user: TUser;
  userLocalAuth: TUserLocalAuth;
};
