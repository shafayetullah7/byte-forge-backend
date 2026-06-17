import { Module } from '@nestjs/common';
import { PaymentMethodRepositoryModule } from '@/_repositories/payment/payment-method.repository';
import { PublicPaymentMethodsController } from './payment-methods.controller';
import { PublicPaymentMethodsService } from './payment-methods.service';

@Module({
  imports: [PaymentMethodRepositoryModule],
  controllers: [PublicPaymentMethodsController],
  providers: [PublicPaymentMethodsService],
  exports: [PublicPaymentMethodsService],
})
export class PublicPaymentMethodsModule {}
