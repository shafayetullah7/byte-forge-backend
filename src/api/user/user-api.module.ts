import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { UserAuthModule } from './user-auth/user-auth.module';
import { SellerApiModule } from './seller/seller-api.module';

@Module({
  imports: [UserModule, UserAuthModule, SellerApiModule],
  exports: [UserModule, UserAuthModule, SellerApiModule],
})
export class UserApiModule {}
