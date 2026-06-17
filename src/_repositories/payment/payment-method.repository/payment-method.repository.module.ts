import { Module } from '@nestjs/common';
import { PaymentMethodRepository } from './payment-method.repository';

@Module({
  providers: [PaymentMethodRepository],
  exports: [PaymentMethodRepository],
})
export class PaymentMethodRepositoryModule {}
