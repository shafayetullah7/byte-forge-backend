import { TUser, TUserLocalAuth } from '@/drizzle/schema';

export type UserAuth = {
  user: TUser;
  userLocalAuth: TUserLocalAuth;
};
