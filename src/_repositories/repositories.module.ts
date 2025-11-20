import { Global, Module } from '@nestjs/common';
import { MediaRepository } from './providers/media/media.repository';

@Global()
@Module({
  providers: [MediaRepository],
  exports: [MediaRepository],
})
export class RepositoriesModule {}
