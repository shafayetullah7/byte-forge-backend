import { Module } from '@nestjs/common';
import { PlantsController } from './plants.controller';
import { PlantsService } from './plants.service';
import { CreatePlantService } from './services/create-plant.service';
import { ListPlantsService } from './services/list-plants.service';
import { MediaRepositoryModule } from '@/_repositories/providers/media/media.repository/media.repository.module';
import { CategoryRepositoryModule } from '@/_repositories/library/taxonomy/category.repository.module';
import { TagRepositoryModule } from '@/_repositories/library/taxonomy/tag.repository.module';
import { VerifiedUserAuthGuardModule } from '@/common/guards/verified-user-auth-guard/verified-user-auth.guard.module';
import { ShopRepositoryModule } from '@/_repositories/business/shop.repository/shop.repository.module';

@Module({
  controllers: [PlantsController],
  providers: [PlantsService, CreatePlantService, ListPlantsService],
  imports: [
    MediaRepositoryModule,
    CategoryRepositoryModule,
    TagRepositoryModule,
    VerifiedUserAuthGuardModule,
    ShopRepositoryModule,
  ],
  exports: [PlantsModule],
})
export class PlantsModule {}
