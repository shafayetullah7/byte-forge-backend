import { Module } from '@nestjs/common';
import { PlantRepository } from './plant.repository';
import { DrizzleModule } from '@/_db/drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  providers: [PlantRepository],
  exports: [PlantRepository],
})
export class PlantRepositoryModule {}
