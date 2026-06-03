import { Injectable, Logger } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { userAddressesTable } from '@/_db/drizzle/schema';
import { CustomException } from '@/common/exceptions/custom.exception';
import { AddressResponseDto } from '../response/address-response.dto';
import { resolveTranslation } from '@/common/utils/resolve-translation.util';

@Injectable()
export class GetAddressByIdService {
  private readonly logger = new Logger(GetAddressByIdService.name);

  constructor(private readonly db: DrizzleService) {}

  async execute(
    addressId: string,
    userId: string,
    locale: string = 'en',
  ): Promise<AddressResponseDto> {
    try {
      const address = await this.db.client.query.userAddressesTable.findFirst({
        where: and(
          eq(userAddressesTable.id, addressId),
          eq(userAddressesTable.userId, userId),
        ),
        with: {
          district: { with: { translations: true } },
          division: { with: { translations: true } },
        },
      });

      if (!address) {
        throw CustomException.notFound({
          message: 'Address not found',
          details: 'No address found with the given ID for this user',
        });
      }

      return this.mapToResponse(address, locale);
    } catch (error) {
      if (error instanceof CustomException) throw error;
      this.logger.error(
        `Failed to get address ${addressId} for user ${userId}`,
        error,
      );
      throw error;
    }
  }

  private mapToResponse(
    address: {
      id: string;
      type: string;
      label: string;
      recipientName: string;
      phone: string;
      addressLine1: string;
      addressLine2: string | null;
      districtId: string;
      divisionId: string;
      postalCode: string | null;
      country: string;
      companyName: string | null;
      deliveryInstructions: string | null;
      billingNotes: string | null;
      isDefault: boolean;
      createdAt: Date;
      updatedAt: Date;
      district: { translations: Array<{ locale: string; name: string }> } | null;
      division: { translations: Array<{ locale: string; name: string }> } | null;
    },
    locale: string,
  ): AddressResponseDto {
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
      districtId: address.districtId,
      divisionId: address.divisionId,
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
