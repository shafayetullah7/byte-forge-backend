import { Module } from '@nestjs/common';
import { PublicLocationService } from './location.service';
import { PublicLocationController } from './location.controller';

@Module({
  controllers: [PublicLocationController],
  providers: [PublicLocationService],
  exports: [PublicLocationService],
})
export class PublicLocationModule {}
