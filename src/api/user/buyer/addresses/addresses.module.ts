import { Module } from '@nestjs/common';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';
import { CreateAddressService } from './services/create-address.service';
import { GetAddressesService } from './services/get-addresses.service';
import { GetAddressByIdService } from './services/get-address-by-id.service';
import { UpdateAddressService } from './services/update-address.service';
import { DeleteAddressService } from './services/delete-address.service';
import { SetDefaultAddressService } from './services/set-default-address.service';
import { UserAddressRepositoryModule } from '@/_repositories/user/user-address.repository';
import { DrizzleModule } from '@/_db/drizzle/drizzle.module';

@Module({
  imports: [UserAddressRepositoryModule, DrizzleModule],
  controllers: [AddressesController],
  providers: [
    AddressesService,
    CreateAddressService,
    GetAddressesService,
    GetAddressByIdService,
    UpdateAddressService,
    DeleteAddressService,
    SetDefaultAddressService,
  ],
  exports: [AddressesService],
})
export class AddressesModule {}
