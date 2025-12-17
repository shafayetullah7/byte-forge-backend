import { Module } from '@nestjs/common';
import { ShopSocialMediaRepository } from './shop.social.media.repository';

@Module({
  providers: [ShopSocialMediaRepository],
  exports: [ShopSocialMediaRepository],
})
export class ShopSocialMediaRepositoryModule {}
