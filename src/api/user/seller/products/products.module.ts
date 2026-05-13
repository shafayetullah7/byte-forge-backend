import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ListProductsService } from './services/list-products.service';
import { VerifiedUserAuthGuardModule } from '@/common/guards/verified-user-auth-guard/verified-user-auth.guard.module';
import { ShopRepositoryModule } from '@/_repositories/business/shop.repository/shop.repository.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ListProductsService],
  imports: [
    VerifiedUserAuthGuardModule,
    ShopRepositoryModule,
  ],
})
export class ProductsModule {}
