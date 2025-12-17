import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { CloudinaryModule } from '@/common/modules/cloudinary/cloudinary.module';
import { MediaRepositoryModule } from '@/_repositories/providers/media/media.repository/media.repository.module';

@Module({
  controllers: [MediaController],
  providers: [MediaService],
  imports: [CloudinaryModule, MediaRepositoryModule],
  exports: [MediaService],
})
export class MediaModule {}
