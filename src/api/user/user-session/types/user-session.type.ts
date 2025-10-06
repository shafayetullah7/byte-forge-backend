import { TUser } from '@/drizzle/schema';

export type ActiveUserSession = TUser & {
  session?: {
    id: string;
    ip: string | null;
    revoked: boolean;
    logoutAt: Date | null;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
  };
};
