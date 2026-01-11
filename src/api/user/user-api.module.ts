import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { UserAuthModule } from './user-auth/user-auth.module';
import { BusinessAccountModule } from './seller/business-account/business-account.module';
import { ShopModule } from './seller/shop/shop.module';
import { SellerPlantModule } from './seller/seller-plant/seller-plant.module';

@Module({
  imports: [
    UserModule,
    UserAuthModule,
    BusinessAccountModule,
    ShopModule,
    SellerPlantModule,
  ],
  exports: [
    UserModule,
    UserAuthModule,
    BusinessAccountModule,
    ShopModule,
    SellerPlantModule,
  ],
})
export class UserApiModule {}
