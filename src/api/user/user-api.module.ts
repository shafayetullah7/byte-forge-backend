import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { UserAuthModule } from './user-auth/user-auth.module';
import { SellerApiModule } from './seller/seller-api.module';
import { BuyerApiModule } from './buyer/buyer.module';

import { PasswordResetModule } from './password-reset/password-reset.module';

@Module({
  imports: [UserModule, UserAuthModule, SellerApiModule, BuyerApiModule, PasswordResetModule],
  exports: [UserModule, UserAuthModule, SellerApiModule, BuyerApiModule, PasswordResetModule],
})
export class UserApiModule {}
