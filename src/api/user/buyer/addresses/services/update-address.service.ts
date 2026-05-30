import { Injectable, Logger } from '@nestjs/common';
import { UserAddressRepository } from '@/_repositories/user/user-address.repository';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { CustomException } from '@/common/exceptions/custom.exception';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { AddressResponseDto } from '../response/address-response.dto';

@Injectable()
export class UpdateAddressService {
  private readonly logger = new Logger(UpdateAddressService.name);

  constructor(
    private readonly addressRepository: UserAddressRepository,
    private readonly db: DrizzleService,
  ) {}

  async execute(
    addressId: string,
    userId: string,
    dto: UpdateAddressDto,
  ): Promise<AddressResponseDto> {
    try {
      return await this.db.transaction(async (tx) => {
        const existing = await this.addressRepository.findOne(
          { id: addressId, userId },
          { tx, lock: true },
        );

        if (!existing) {
          throw CustomException.notFound({
            message: 'Address not found',
            details: 'No address found with the given ID for this user',
          });
        }

        const effectiveType = dto.type ?? existing.type;

        if (dto.isDefault) {
          await this.addressRepository.update(
            { isDefault: false },
            { userId, type: effectiveType },
            tx,
          );
        }

        const [updated] = await this.addressRepository.update(
          dto,
          { id: addressId, userId },
          tx,
        );

        if (!updated) {
          throw CustomException.databaseError({
            message: 'Failed to update address',
          });
        }

        return this.mapToResponse(updated);
      });
    } catch (error) {
      if (error instanceof CustomException) throw error;
      this.logger.error(
        `Failed to update address ${addressId} for user ${userId}`,
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
