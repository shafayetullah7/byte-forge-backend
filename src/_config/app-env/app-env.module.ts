import { Global, Module } from '@nestjs/common';
import { AppEnvService } from './app-env.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [AppEnvService],
  exports: [AppEnvService],
})
export class AppEnvModule {}
