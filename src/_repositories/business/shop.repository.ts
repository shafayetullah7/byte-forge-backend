import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import {
  shopAddressTable,
  shopBusinessTable,
  shopContactTable,
  shopManagerTable,
  shopSocialMediaTable,
  shopTable,
  shopVerificationTable,
  TNewShop,
  TNewShopAddress,
  TNewShopBusiness,
  TNewShopContact,
  TNewShopManager,
  TNewShopSocialMedia,
  TNewShopVerification,
  TShop,
  TShopAddress,
  TShopBusiness,
  TShopContact,
  TShopManager,
  TShopSocialMedia,
} from '@/_db/drizzle/schema';
import { Injectable } from '@nestjs/common';
import { DrizzleTx } from '@/_db/drizzle/types';
import { TLockTransaction } from '../_types/lock.transaction';
import { eq } from 'drizzle-orm';

@Injectable()
export class ShopRepository {
  constructor(private readonly db: DrizzleService) {
    this.db = db;
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

  async createShopSocialMedia(
    payload: TNewShopSocialMedia,
    tx?: DrizzleTx,
  ): Promise<TShopSocialMedia> {
    const executor = this.db.getExecutor(tx);

    const [shopSocialMedia] = await executor
      .insert(shopSocialMediaTable)
      .values(payload)
      .returning()
      .execute();

    return shopSocialMedia;
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

  async getShopsByOwnerId(
    ownerId: string,
    transaction?: TLockTransaction,
  ): Promise<TShop[]> {
    const executor = this.db.getExecutor(transaction?.tx);
    const baseQuery = executor
      .select()
      .from(shopTable)
      .where(eq(shopTable.ownerId, ownerId));

    const lockQuery = transaction?.lock ? baseQuery.for('update') : baseQuery;
    const shops = await lockQuery.execute();
    return shops;
  }

  async getShopsByBusinessAccountId(
    businessAccountId: string,
    transaction?: TLockTransaction,
  ) {
    const executor = this.db.getExecutor(transaction?.tx);
    const baseQuery = executor
      .select()
      .from(shopTable)
      .where(eq(shopTable.businessAccountId, businessAccountId));

    const lockQuery = transaction?.lock ? baseQuery.for('update') : baseQuery;
    const shops = await lockQuery.execute();
    return shops;
  }

  async getShopDetailsById(shopId: string, transaction?: TLockTransaction) {
    const executor = this.db.getExecutor(transaction?.tx);

    const data = await executor.query.shopTable
      .findFirst({
        where: eq(shopTable.id, shopId),
        with: {
          shopAddressTable: true,
          shopBusinessTable: true,
        },
      })
      .execute();
    return data;
  }
}
