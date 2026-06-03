import { Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { UserAddressRepository } from '@/_repositories/user/user-address.repository';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import {
  districtsTable,
  divisionsTable,
  userAddressesTable,
} from '@/_db/drizzle/schema';
import { CustomException } from '@/common/exceptions/custom.exception';
import { CreateAddressDto } from '../dto/create-address.dto';
import { AddressResponseDto } from '../response/address-response.dto';
import { resolveTranslation } from '@/common/utils/resolve-translation.util';

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
    locale: string = 'en',
  ): Promise<AddressResponseDto> {
    try {
      const [district, division] = await Promise.all([
        this.validateDistrict(dto.districtId),
        this.validateDivision(dto.divisionId),
      ]);

      if (district.divisionId !== division.id) {
        throw CustomException.badRequest({
          message: 'Invalid location',
          details: 'The selected district does not belong to the selected division',
        });
      }

      return await this.db.transaction(async (tx) => {
        if (dto.isDefault) {
          await this.addressRepository.update(
            { isDefault: false },
            { userId, type: dto.type },
            tx,
          );
        }

        const address = await this.addressRepository.create({ ...dto, userId }, tx);
        return this.mapToResponse(address.id, locale);
      });
    } catch (error) {
      if (error instanceof CustomException) throw error;
      this.logger.error(`Failed to create address for user ${userId}`, error);
      throw error;
    }
  }

  private async validateDistrict(districtId: string) {
    const district = await this.db.client.query.districtsTable.findFirst({
      where: eq(districtsTable.id, districtId),
      columns: { id: true, divisionId: true },
    });

    if (!district) {
      throw CustomException.badRequest({
        message: 'Invalid district',
        details: `District with ID "${districtId}" does not exist`,
      });
    }

    return district;
  }

  private async validateDivision(divisionId: string) {
    const division = await this.db.client.query.divisionsTable.findFirst({
      where: eq(divisionsTable.id, divisionId),
      columns: { id: true },
    });

    if (!division) {
      throw CustomException.badRequest({
        message: 'Invalid division',
        details: `Division with ID "${divisionId}" does not exist`,
      });
    }

    return division;
  }

  private async mapToResponse(
    addressId: string,
    locale: string,
  ): Promise<AddressResponseDto> {
    const address = await this.db.client.query.userAddressesTable.findFirst({
      where: eq(userAddressesTable.id, addressId),
      with: {
        district: { with: { translations: true } },
        division: { with: { translations: true } },
      },
    });

    if (!address) {
      throw CustomException.databaseError({
        message: 'Created address not found',
      });
    }

    const districtTranslation = resolveTranslation(address.district?.translations, locale);
    const divisionTranslation = resolveTranslation(address.division?.translations, locale);

    return {
      id: address.id,
      type: address.type,
      label: address.label,
      recipientName: address.recipientName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: districtTranslation?.name ?? '',
      state: divisionTranslation?.name ?? null,
      postalCode: address.postalCode,
      country: address.country,
      companyName: address.companyName,
      deliveryInstructions: address.deliveryInstructions,
      billingNotes: address.billingNotes,
      isDefault: address.isDefault,
      createdAt: address.createdAt.toISOString(),
      updatedAt: address.updatedAt.toISOString(),
    };
  }
}
