import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { DrizzleModule } from '../../_db/drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
