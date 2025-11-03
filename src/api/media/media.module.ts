import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { CloudinaryModule } from '@/common/modules/cloudinary/cloudinary.module';

@Module({
  controllers: [MediaController],
  providers: [MediaService],
  imports: [CloudinaryModule],
})
export class MediaModule {}
