import { Module } from '@nestjs/common';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';
import { ShopRepositoryModule } from '@/_repositories/business/shop.repository/shop.repository.module';
import { ShopVerificationRepositoryModule } from '@/_repositories/business/shop.verification.repository/shop.verification.repository.module';
import { MediaRepositoryModule } from '@/_repositories/providers/media/media.repository/media.repository.module';
import { VerifiedUserAuthGuardModule } from '@/common/guards/verified-user-auth-guard/verified-user-auth.guard.module';

@Module({
  controllers: [ShopController],
  providers: [ShopService],
  imports: [
    ShopRepositoryModule,
    ShopVerificationRepositoryModule,
    MediaRepositoryModule,
    VerifiedUserAuthGuardModule,
  ],
})
export class ShopModule {}
