import { Injectable, Logger } from '@nestjs/common';
import { UserAddressRepository } from '@/_repositories/user/user-address.repository';
import { CustomException } from '@/common/exceptions/custom.exception';
import { AddressResponseDto } from '../response/address-response.dto';
import { PaginationParams } from '@/common/schemas/pagination.schema';

@Injectable()
export class GetAddressesService {
  private readonly logger = new Logger(GetAddressesService.name);

  constructor(private readonly addressRepository: UserAddressRepository) {}

  async execute(
    userId: string,
    pagination?: PaginationParams & { type?: 'shipping' | 'billing' | 'both' },
  ): Promise<{ addresses: AddressResponseDto[]; total: number }> {
    try {
      const addresses = await this.addressRepository.findMany({
        userId,
        type: pagination?.type,
      });

      const mapped = addresses.map((a) => this.mapToResponse(a));

      return {
        addresses: mapped,
        total: mapped.length,
      };
    } catch (error) {
      if (error instanceof CustomException) throw error;
      this.logger.error(
        `Failed to get addresses for user ${userId}`,
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
