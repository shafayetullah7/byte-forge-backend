import { Module } from '@nestjs/common';
import { UserAddressRepository } from './user-address.repository';

@Module({
  providers: [UserAddressRepository],
  exports: [UserAddressRepository],
})
export class UserAddressRepositoryModule {}
