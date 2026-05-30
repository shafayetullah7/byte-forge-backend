import { Injectable, Logger } from '@nestjs/common';
import { UserAddressRepository } from '@/_repositories/user/user-address.repository';
import { CustomException } from '@/common/exceptions/custom.exception';
import { AddressResponseDto } from '../response/address-response.dto';

@Injectable()
export class GetAddressByIdService {
  private readonly logger = new Logger(GetAddressByIdService.name);

  constructor(private readonly addressRepository: UserAddressRepository) {}

  async execute(
    addressId: string,
    userId: string,
  ): Promise<AddressResponseDto> {
    try {
      const address = await this.addressRepository.findOne({
        id: addressId,
        userId,
      });

      if (!address) {
        throw CustomException.notFound({
          message: 'Address not found',
          details: 'No address found with the given ID for this user',
        });
      }

      return this.mapToResponse(address);
    } catch (error) {
      if (error instanceof CustomException) throw error;
      this.logger.error(
        `Failed to get address ${addressId} for user ${userId}`,
        error,
      );
      throw error;
    }
  }

  private mapToResponse(address: any): AddressResponseDto {
    return {
      id: address.id,
      type: address.type,
      label: address.label,
      recipientName: address.recipientName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      companyName: address.companyName,
      gstin: address.gstin,
      deliveryInstructions: address.deliveryInstructions,
      billingNotes: address.billingNotes,
      isDefault: address.isDefault,
      createdAt: address.createdAt?.toISOString?.() ?? String(address.createdAt),
      updatedAt: address.updatedAt?.toISOString?.() ?? String(address.updatedAt),
    };
  }
}
