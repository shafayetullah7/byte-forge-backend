import { Module } from '@nestjs/common';
import { AdminTagGroupTranslationsController } from './admin-tag-group-translations.controller';
import { AdminTagGroupTranslationsService } from './admin-tag-group-translations.service';

@Module({
  controllers: [AdminTagGroupTranslationsController],
  providers: [AdminTagGroupTranslationsService],
  exports: [AdminTagGroupTranslationsService],
})
export class AdminTagGroupTranslationsModule {}
