import { Module } from '@nestjs/common';
import { DrizzleModule } from '@/_db/drizzle/drizzle.module';
import { SubscriptionModule } from '@/modules/subscription/subscription.module';
import { SearchSuggestQuery } from './application/queries';
import { PublicSearchController } from './controllers';

@Module({
  imports: [DrizzleModule, SubscriptionModule],
  controllers: [PublicSearchController],
  providers: [SearchSuggestQuery],
})
export class SearchModule {}
