import { Injectable, Logger } from '@nestjs/common';
import { UserAddressRepository } from '@/_repositories/user/user-address.repository';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { CustomException } from '@/common/exceptions/custom.exception';
import { CreateAddressDto } from '../dto/create-address.dto';
import { AddressResponseDto } from '../response/address-response.dto';

@Injectable()
export class CreateAddressService {
  private readonly logger = new Logger(CreateAddressService.name);

  constructor(
    private readonly addressRepository: UserAddressRepository,
    private readonly db: DrizzleService,
  ) {}

  async execute(
    userId: string,
    dto: CreateAddressDto,
  ): Promise<AddressResponseDto> {
    try {
      return await this.db.transaction(async (tx) => {
        const data = {
          ...dto,
          userId,
        };

        if (dto.isDefault) {
          await this.addressRepository.update(
            { isDefault: false },
            { userId, type: dto.type },
            tx,
          );
        }

        const address = await this.addressRepository.create(data, tx);
        return this.mapToResponse(address);
      });
    } catch (error) {
      if (error instanceof CustomException) throw error;
      this.logger.error(`Failed to create address for user ${userId}`, error);
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
      deliveryInstructions: address.deliveryInstructions,
      billingNotes: address.billingNotes,
      isDefault: address.isDefault,
      createdAt: address.createdAt?.toISOString?.() ?? String(address.createdAt),
      updatedAt: address.updatedAt?.toISOString?.() ?? String(address.updatedAt),
    };
  }
}
