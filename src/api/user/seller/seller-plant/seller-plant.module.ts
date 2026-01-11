import { Module } from '@nestjs/common';
import { SellerPlantController } from './seller-plant.controller';
import { SellerPlantService } from './seller-plant.service';
import { PlantRepositoryModule } from '@/_repositories/business/plant.repository/plant.repository.module';
import { AdminSessionModule } from '@/api/admin/admin-session/admin-session.module';
import { SessionRepositoryModule } from '@/_repositories/auth/session.repository/session.repository.module';
import { DrizzleModule } from '@/_db/drizzle/drizzle.module';

@Module({
  imports: [
    PlantRepositoryModule,
    AdminSessionModule,
    SessionRepositoryModule,
    DrizzleModule,
  ],
  controllers: [SellerPlantController],
  providers: [SellerPlantService],
})
export class SellerPlantModule {}
