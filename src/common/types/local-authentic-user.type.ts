import { TUser, TUserLocalAuth } from '@/_db/drizzle/schema';

export type LocalAuthenticUser = {
  user: TUser;
  userLocalAuth: TUserLocalAuth;
};
