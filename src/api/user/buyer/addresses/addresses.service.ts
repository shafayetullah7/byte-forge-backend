import { Injectable } from '@nestjs/common';
import { CreateAddressService } from './services/create-address.service';
import { GetAddressesService } from './services/get-addresses.service';
import { GetAddressByIdService } from './services/get-address-by-id.service';
import { UpdateAddressService } from './services/update-address.service';
import { DeleteAddressService } from './services/delete-address.service';
import { SetDefaultAddressService } from './services/set-default-address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AddressResponseDto } from './response/address-response.dto';
import { TUserAddress } from '@/_db/drizzle/schema';
import { PaginationParams } from '@/common/schemas/pagination.schema';

@Injectable()
export class AddressesService {
  constructor(
    private readonly createAddressService: CreateAddressService,
    private readonly getAddressesService: GetAddressesService,
    private readonly getAddressByIdService: GetAddressByIdService,
    private readonly updateAddressService: UpdateAddressService,
    private readonly deleteAddressService: DeleteAddressService,
    private readonly setDefaultAddressService: SetDefaultAddressService,
  ) {}

  async create(
    userId: string,
    dto: CreateAddressDto,
  ): Promise<TUserAddress> {
    return this.createAddressService.execute(userId, dto);
  }

  async findAll(
    userId: string,
    locale: string,
    pagination?: PaginationParams & { type?: 'shipping' | 'billing' | 'both' },
  ): Promise<{ addresses: AddressResponseDto[]; total: number }> {
    return this.getAddressesService.execute(userId, locale, pagination);
  }

  async findById(
    addressId: string,
    userId: string,
    locale: string = 'en',
  ): Promise<AddressResponseDto> {
    return this.getAddressByIdService.execute(addressId, userId, locale);
  }

  async update(
    addressId: string,
    userId: string,
    dto: UpdateAddressDto,
  ): Promise<TUserAddress> {
    return this.updateAddressService.execute(addressId, userId, dto);
  }

  async delete(addressId: string, userId: string): Promise<void> {
    return this.deleteAddressService.execute(addressId, userId);
  }

  async setDefault(
    addressId: string,
    userId: string,
  ): Promise<TUserAddress> {
    return this.setDefaultAddressService.execute(addressId, userId);
  }
}
