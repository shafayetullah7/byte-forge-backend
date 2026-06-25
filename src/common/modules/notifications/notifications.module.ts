import { Module } from '@nestjs/common';
import { EmailModule } from '@/common/modules/email/email.module';
import { AppEnvModule } from '@/_config/app-env/app-env.module';
import { UserLocalAuthRepositoryModule } from '@/_repositories/user/user.local.auth.repository/user.local.auth.repository.module';
import { ShopContactRepositoryModule } from '@/_repositories/business/shop.contact.repository/shop.contact.repository.module';
import { ShopRepository } from '@/_repositories/business/shop.repository/shop.repository';
import { TransactionalEmailListener } from './listeners/transactional-email.listener';
import { NotificationRecipientService } from './services/notification-recipient.service';
import { TransactionalEmailService } from './services/transactional-email.service';

@Module({
  imports: [
    EmailModule,
    AppEnvModule,
    UserLocalAuthRepositoryModule,
    ShopContactRepositoryModule,
  ],
  providers: [
    TransactionalEmailListener,
    NotificationRecipientService,
    TransactionalEmailService,
    ShopRepository,
  ],
})
export class NotificationsModule {}
