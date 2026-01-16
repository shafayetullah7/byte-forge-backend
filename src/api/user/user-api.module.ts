import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { UserAuthModule } from './user-auth/user-auth.module';
import { SellerApiModule } from './seller/seller-api.module';

import { PasswordResetModule } from './password-reset/password-reset.module';

@Module({
  imports: [UserModule, UserAuthModule, SellerApiModule, PasswordResetModule],
  exports: [UserModule, UserAuthModule, SellerApiModule, PasswordResetModule],
})
export class UserApiModule {}
