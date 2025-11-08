import { Module } from '@nestjs/common';
import { MediaRepository } from './providers/media/media.repository';

@Module({
  providers: [MediaRepository],
})
export class RepositoriesModule {}
