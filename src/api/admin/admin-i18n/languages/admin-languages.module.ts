import { Module } from '@nestjs/common';
import { AdminLanguagesController } from './admin-languages.controller';
import { AdminLanguagesService } from './admin-languages.service';

@Module({
  controllers: [AdminLanguagesController],
  providers: [AdminLanguagesService],
  exports: [AdminLanguagesService],
})
export class AdminLanguagesModule {}
