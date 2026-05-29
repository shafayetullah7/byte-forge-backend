import { Module } from '@nestjs/common';
import { ShippingRatesController } from './shipping-rates.controller';
import { ShippingRatesService } from './shipping-rates.service';
import { ShopRepositoryModule } from '@/_repositories/business/shop.repository/shop.repository.module';
import { ShopShippingRatesRepositoryModule } from '@/_repositories/business/shop.shipping-rates.repository/shop.shipping-rates.repository.module';
import { VerifiedUserAuthGuardModule } from '@/common/guards/verified-user-auth-guard/verified-user-auth.guard.module';

@Module({
  controllers: [ShippingRatesController],
  providers: [ShippingRatesService],
  imports: [
    ShopRepositoryModule,
    ShopShippingRatesRepositoryModule,
    VerifiedUserAuthGuardModule,
  ],
})
export class ShippingRatesModule {}
