import { Module } from '@nestjs/common';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';
import { ShopRepositoryModule } from '@/_repositories/business/shop.repository/shop.repository.module';
import { BusinessAccountRepositoryModule } from '@/_repositories/business/business.account.repository/business.account.repository.module';
import { MediaRepositoryModule } from '@/_repositories/providers/media/media.repository/media.repository.module';

@Module({
  controllers: [ShopController],
  providers: [ShopService],
  imports: [
    ShopRepositoryModule,
    BusinessAccountRepositoryModule,
    MediaRepositoryModule,
  ],
})
export class ShopModule {}
