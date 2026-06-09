import { Injectable, Logger } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { userAddressesTable } from '@/_db/drizzle/schema';
import { resolveTranslation } from '@/common/utils/resolve-translation.util';
import { AddressResponseDto } from '../response/address-response.dto';
import { PaginationParams } from '@/common/schemas/pagination.schema';

@Injectable()
export class GetAddressesService {
  private readonly logger = new Logger(GetAddressesService.name);

  constructor(private readonly db: DrizzleService) {}

  async execute(
    userId: string,
    locale: string,
    pagination?: PaginationParams & { type?: 'shipping' | 'billing' | 'both' },
  ): Promise<{ addresses: AddressResponseDto[]; total: number }> {
    try {
      const typeFilter =
        pagination?.type && pagination.type !== 'both'
          ? pagination.type
          : undefined;

      const addresses = await this.db.client.query.userAddressesTable.findMany({
        where: typeFilter
          ? and(
              eq(userAddressesTable.userId, userId),
              eq(userAddressesTable.type, typeFilter),
            )
          : eq(userAddressesTable.userId, userId),
        orderBy: (table, { asc }) => asc(table.createdAt),
        with: {
          district: {
            with: {
              translations: true,
            },
          },
          division: {
            with: {
              translations: true,
            },
          },
        },
      });

      if (addresses.length === 0) {
        return { addresses: [], total: 0 };
      }

      const resolvedAddresses = addresses.map((row) =>
        this.mapToResponse(row, locale),
      );

      return {
        addresses: resolvedAddresses,
        total: resolvedAddresses.length,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get addresses for user ${userId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  private mapToResponse(
    row: {
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
      createdAt: Date | string;
      updatedAt: Date | string;
      district: {
        translations: Array<{ locale: string; name: string }>;
      } | null;
      division: {
        translations: Array<{ locale: string; name: string }>;
      } | null;
    },
    locale: string,
  ): AddressResponseDto {
    const districtTranslation = resolveTranslation(
      row.district?.translations,
      locale,
    );
    const divisionTranslation = resolveTranslation(
      row.division?.translations,
      locale,
    );

    const createdAt = row.createdAt;
    const updatedAt = row.updatedAt;

    return {
      id: row.id,
      type: row.type,
      label: row.label,
      recipientName: row.recipientName,
      phone: row.phone,
      addressLine1: row.addressLine1,
      addressLine2: row.addressLine2 ?? null,
      districtId: row.districtId,
      divisionId: row.divisionId,
      city: districtTranslation?.name ?? '',
      state: divisionTranslation?.name ?? null,
      postalCode: row.postalCode ?? null,
      country: row.country,
      companyName: row.companyName ?? null,
      deliveryInstructions: row.deliveryInstructions ?? null,
      billingNotes: row.billingNotes ?? null,
      isDefault: row.isDefault,
      createdAt:
        createdAt instanceof Date ? createdAt.toISOString() : String(createdAt),
      updatedAt:
        updatedAt instanceof Date ? updatedAt.toISOString() : String(updatedAt),
    };
  }
}
