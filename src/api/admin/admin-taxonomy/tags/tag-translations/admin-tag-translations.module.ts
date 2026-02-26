import { Module } from '@nestjs/common';
import { AdminTagTranslationsController } from './admin-tag-translations.controller';
import { AdminTagTranslationsService } from './admin-tag-translations.service';

@Module({
  controllers: [AdminTagTranslationsController],
  providers: [AdminTagTranslationsService],
  exports: [AdminTagTranslationsService],
})
export class AdminTagTranslationsModule {}
