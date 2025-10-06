import { Module } from '@nestjs/common';
import { FruitResolver } from './resolvers/fruit.resolver';
import { FruitModule } from '@/api/fruit/fruit.module';

@Module({
  providers: [FruitResolver],
  exports: [FruitResolver],
  imports: [FruitModule],
})
export class FruitGqlModule {}
