import { TUser, TUserLocalAuth } from '@/drizzle/schema';

export type LocalAuthenticUser = {
  user: TUser;
  userLocalAuth: TUserLocalAuth;
};
