import { Module } from '@nestjs/common';
import { PublicTagsService } from './tags.service';
import { PublicTagsController } from './tags.controller';

@Module({
  controllers: [PublicTagsController],
  providers: [PublicTagsService],
  exports: [PublicTagsService],
})
export class PublicTagsModule {}
