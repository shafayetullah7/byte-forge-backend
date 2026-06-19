import { Module } from '@nestjs/common';
import { AdminMediaController } from './admin-media.controller';
import { AdminMediaService } from './admin-media.service';
import { CloudinaryModule } from '@/common/modules/cloudinary/cloudinary.module';
import { MediaRepositoryModule } from '@/_repositories/providers/media/media.repository/media.repository.module';
import { DrizzleModule } from '@/_db/drizzle/drizzle.module';
import { LoggerModule } from '@/common/modules/logger/logger.module';

@Module({
  imports: [
    CloudinaryModule,
    MediaRepositoryModule,
    DrizzleModule,
    LoggerModule,
  ],
  controllers: [AdminMediaController],
  providers: [AdminMediaService],
  exports: [AdminMediaService],
})
export class AdminMediaModule {}
