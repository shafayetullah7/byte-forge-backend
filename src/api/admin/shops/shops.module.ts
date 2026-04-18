import { Module } from '@nestjs/common';
import { ShopsController } from './shops.controller';
import { ShopsService } from './shops.service';
import { DrizzleModule } from '../../../_db/drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  controllers: [ShopsController],
  providers: [ShopsService],
  exports: [ShopsService],
})
export class AdminShopsModule {}
