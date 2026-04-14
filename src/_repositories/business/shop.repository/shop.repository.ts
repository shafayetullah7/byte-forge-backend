import { eq } from 'drizzle-orm';
import { ShopStatusEnum } from '@/_db/drizzle/enum';

import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import {
  shopAddressTable,
  shopAddressTranslationsTable,
  shopBusinessTable,
  shopContactTable,
  shopManagerTable,
  shopTable,
  shopTranslationsTable,
  shopVerificationTable,
  TNewShop,
  TNewShopAddress,
  TNewShopAddressTranslation,
  TNewShopBusiness,
  TNewShopContact,
  TNewShopManager,
  TNewShopTranslation,
  TNewShopVerification,
  TShop,
  TShopAddress,
  TShopAddressTranslation,
  TShopBusiness,
  TShopContact,
  TShopManager,
  TShopTranslation,
  TShopVerification,
} from '@/_db/drizzle/schema/shop';
import { Injectable } from '@nestjs/common';
import { DrizzleTx } from '@/_db/drizzle/types';
import { TLockTransaction } from '../../_types/lock.transaction';

@Injectable()
export class ShopRepository {
  constructor(private readonly db: DrizzleService) {}

  async getShopBySlug(slug: string) {
    const data = await this.db.client.query.shopTable
      .findFirst({
        where: eq(shopTable.slug, slug),
        with: {
          translations: true,
          logo: true,
          banner: true,
          shopAddressTable: true,
          shopContactTable: true,
        },
      })
      .execute();
    return data;
  }

  async findShopBySlug(
    slug: string,
    transaction?: TLockTransaction,
  ): Promise<TShop | undefined> {
    const executor = this.db.getExecutor(transaction?.tx);
    const baseQuery = executor
      .select()
      .from(shopTable)
      .where(eq(shopTable.slug, slug));

    const lockQuery = transaction?.lock ? baseQuery.for('update') : baseQuery;
    const [shop] = await lockQuery.execute();
    return shop;
  }
  async createShop(payload: TNewShop, tx?: DrizzleTx): Promise<TShop> {
    const executor = this.db.getExecutor(tx);
    const [createdShop] = await executor
      .insert(shopTable)
      .values(payload)
      .returning()
      .execute();
    return createdShop;
  }

  async createShopAddress(
    payload: TNewShopAddress,
    tx?: DrizzleTx,
  ): Promise<TShopAddress> {
    const executor = this.db.getExecutor(tx);
    const [createdShop] = await executor
      .insert(shopAddressTable)
      .values(payload)
      .returning()
      .execute();
    return createdShop;
  }

  async createShopBusiness(
    payload: TNewShopBusiness,
    tx?: DrizzleTx,
  ): Promise<TShopBusiness> {
    const executor = this.db.getExecutor(tx);
    const [createdShop] = await executor
      .insert(shopBusinessTable)
      .values(payload)
      .returning()
      .execute();
    return createdShop;
  }

  async createShopContact(
    payload: TNewShopContact,
    tx?: DrizzleTx,
  ): Promise<TShopContact> {
    const executor = this.db.getExecutor(tx);
    const [createdShop] = await executor
      .insert(shopContactTable)
      .values(payload)
      .returning()
      .execute();
    return createdShop;
  }

  async createShopManager(
    payload: TNewShopManager,
    tx?: DrizzleTx,
  ): Promise<TShopManager> {
    const executor = this.db.getExecutor(tx);
    const [shopManager] = await executor
      .insert(shopManagerTable)
      .values(payload)
      .returning()
      .execute();

    return shopManager;
  }

  async createShopTranslation(
    payload: TNewShopTranslation,
    tx?: DrizzleTx,
  ): Promise<TShopTranslation> {
    const executor = this.db.getExecutor(tx);
    const [createdTranslation] = await executor
      .insert(shopTranslationsTable)
      .values(payload)
      .returning()
      .execute();
    return createdTranslation;
  }

  async createShopTranslations(
    payload: TNewShopTranslation[],
    tx?: DrizzleTx,
  ): Promise<TShopTranslation[]> {
    const executor = this.db.getExecutor(tx);
    return await executor
      .insert(shopTranslationsTable)
      .values(payload)
      .returning()
      .execute();
  }

  async createShopVerification(payload: TNewShopVerification, tx?: DrizzleTx) {
    const executor = this.db.getExecutor(tx);
    const [createdShopVerification] = await executor
      .insert(shopVerificationTable)
      .values(payload)
      .returning()
      .execute();
    return createdShopVerification;
  }

  async getShopById(id: string, transaction?: TLockTransaction) {
    const executor = this.db.getExecutor(transaction?.tx);
    const baseQuery = executor
      .select()
      .from(shopTable)
      .where(eq(shopTable.id, id));

    const lockQuery = transaction?.lock ? baseQuery.for('update') : baseQuery;
    const [shop] = await lockQuery.execute();
    return shop;
  }

  async getShopByOwnerId(
    ownerId: string,
    transaction?: TLockTransaction,
  ): Promise<TShop | undefined> {
    const executor = this.db.getExecutor(transaction?.tx);
    const baseQuery = executor
      .select()
      .from(shopTable)
      .where(eq(shopTable.ownerId, ownerId));

    const lockQuery = transaction?.lock ? baseQuery.for('update') : baseQuery;
    const [shop] = await lockQuery.execute();
    return shop;
  }

  async findShopByNameInTranslations(
    shopName: string,
    transaction?: TLockTransaction,
  ): Promise<TShopTranslation | undefined> {
    const executor = this.db.getExecutor(transaction?.tx);
    const baseQuery = executor
      .select()
      .from(shopTranslationsTable)
      .where(eq(shopTranslationsTable.name, shopName));

    const lockQuery = transaction?.lock ? baseQuery.for('update') : baseQuery;
    const [translation] = await lockQuery.execute();
    return translation;
  }

  async update(id: string, data: Partial<TNewShop>, tx?: DrizzleTx) {
    const executor = this.db.getExecutor(tx);
    const [updatedShop] = await executor
      .update(shopTable)
      .set(data)
      .where(eq(shopTable.id, id))
      .returning()
      .execute();
    return updatedShop;
  }

  async getShopByOwnerWithRelations(ownerId: string) {
    return await this.db.client.query.shopTable.findFirst({
      where: eq(shopTable.ownerId, ownerId),
      with: {
        translations: true,
        logo: true,
        banner: true,
        shopAddressTable: {
          with: {
            translations: true,
          },
        },
        shopContactTable: true,
        shopBusinessTable: true,
        shopVerificationTable: true,
      },
    });
  }

  async getShopByOwnerBranding(ownerId: string) {
    return await this.db.client.query.shopTable.findFirst({
      where: eq(shopTable.ownerId, ownerId),
      with: {
        translations: true,
        logo: true,
        banner: true,
        shopContactTable: true,
        shopAddressTable: {
          with: {
            translations: true,
          },
        },
      },
    });
  }

  async getShopByOwnerMinimal(ownerId: string) {
    return await this.db.client.query.shopTable.findFirst({
      where: eq(shopTable.ownerId, ownerId),
      with: {
        translations: true,
      },
    });
  }

  async getShopWithRelations(id: string) {
    return await this.db.client.query.shopTable.findFirst({
      where: eq(shopTable.id, id),
      with: {
        translations: true,
        logo: true,
        banner: true,
        shopAddressTable: {
          with: {
            translations: true,
          },
        },
        shopContactTable: true,
        shopBusinessTable: true,
        shopVerificationTable: true,
      },
    });
  }

  async upsertShopTranslation(
    payload: TNewShopTranslation,
    tx?: DrizzleTx,
  ): Promise<TShopTranslation> {
    const executor = this.db.getExecutor(tx);
    const [translation] = await executor
      .insert(shopTranslationsTable)
      .values(payload)
      .onConflictDoUpdate({
        target: [shopTranslationsTable.shopId, shopTranslationsTable.locale],
        set: {
          name: payload.name,
          description: payload.description,
          businessHours: payload.businessHours,
        },
      })
      .returning()
      .execute();
    return translation;
  }

  async upsertShopContact(
    shopId: string,
    payload: Partial<
      Pick<
        TNewShopContact,
        | 'businessEmail'
        | 'phone'
        | 'alternativePhone'
        | 'whatsapp'
        | 'telegram'
        | 'facebook'
        | 'instagram'
        | 'x'
      >
    >,
    tx?: DrizzleTx,
  ): Promise<TShopContact> {
    const executor = this.db.getExecutor(tx);
    const [contact] = await executor
      .insert(shopContactTable)
      .values({
        shopId,
        businessEmail: payload.businessEmail ?? '', // Default to empty string for required field
        phone: payload.phone ?? '', // Default to empty string for required field
        alternativePhone: payload.alternativePhone ?? null,
        whatsapp: payload.whatsapp ?? null,
        telegram: payload.telegram ?? null,
        facebook: payload.facebook ?? null,
        instagram: payload.instagram ?? null,
        x: payload.x ?? null,
      })
      .onConflictDoUpdate({
        target: [shopContactTable.shopId],
        set: {
          ...(payload.businessEmail !== undefined && {
            businessEmail: payload.businessEmail,
          }),
          ...(payload.phone !== undefined && { phone: payload.phone }),
          ...(payload.alternativePhone !== undefined && {
            alternativePhone: payload.alternativePhone,
          }),
          ...(payload.whatsapp !== undefined && { whatsapp: payload.whatsapp }),
          ...(payload.telegram !== undefined && { telegram: payload.telegram }),
          ...(payload.facebook !== undefined && { facebook: payload.facebook }),
          ...(payload.instagram !== undefined && {
            instagram: payload.instagram,
          }),
          ...(payload.x !== undefined && { x: payload.x }),
        },
      })
      .returning()
      .execute();
    return contact;
  }

  async upsertShopAddress(
    shopId: string,
    payload: Partial<
      Pick<
        TNewShopAddress,
        | 'postalCode'
        | 'latitude'
        | 'longitude'
        | 'googleMapsLink'
      >
    >,
    tx?: DrizzleTx,
  ): Promise<TShopAddress> {
    const executor = this.db.getExecutor(tx);
    const [address] = await executor
      .insert(shopAddressTable)
      .values({
        shopId,
        postalCode: payload.postalCode ?? '', // Required field
        latitude: payload.latitude ?? null,
        longitude: payload.longitude ?? null,
        googleMapsLink: payload.googleMapsLink ?? null,
      })
      .onConflictDoUpdate({
        target: [shopAddressTable.shopId],
        set: {
          ...(payload.postalCode !== undefined && {
            postalCode: payload.postalCode,
          }),
          ...(payload.latitude !== undefined && { latitude: payload.latitude }),
          ...(payload.longitude !== undefined && {
            longitude: payload.longitude,
          }),
          ...(payload.googleMapsLink !== undefined && {
            googleMapsLink: payload.googleMapsLink,
          }),
        },
      })
      .returning()
      .execute();
    return address;
  }

  /**
   * Upserts shop address translation for a specific locale
   * @param addressId The ID of the address to translate
   * @param payload Translation fields (country, division, district, street)
   * @param locale The locale code (e.g., 'bn', 'en') for this translation
   * @param tx Optional database transaction
   */
  async upsertShopAddressTranslation(
    addressId: string,
    payload: Partial<
      Pick<
        TNewShopAddressTranslation,
        'country' | 'division' | 'district' | 'street' | 'locale'
      >
    >,
    tx?: DrizzleTx,
  ): Promise<TShopAddressTranslation> {
    const executor = this.db.getExecutor(tx);
    const [translation] = await executor
      .insert(shopAddressTranslationsTable)
      .values({
        addressId,
        locale: payload.locale || 'en',
        country: payload.country ?? '',
        division: payload.division ?? '',
        district: payload.district ?? '',
        street: payload.street ?? '',
      })
      .onConflictDoUpdate({
        target: [
          shopAddressTranslationsTable.addressId,
          shopAddressTranslationsTable.locale,
        ],
        set: {
          ...(payload.country !== undefined && { country: payload.country }),
          ...(payload.division !== undefined && { division: payload.division }),
          ...(payload.district !== undefined && { district: payload.district }),
          ...(payload.street !== undefined && { street: payload.street }),
        },
      })
      .returning()
      .execute();
    return translation;
  }
}
