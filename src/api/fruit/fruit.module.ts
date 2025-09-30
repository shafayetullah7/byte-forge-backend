import { Module } from '@nestjs/common';
import { FruitService } from './fruit.service';

@Module({
  providers: [FruitService],
  exports: [FruitService],
})
export class FruitModule {}
