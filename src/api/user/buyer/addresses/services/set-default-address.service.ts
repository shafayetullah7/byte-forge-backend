import { Injectable, Logger } from '@nestjs/common';
import { UserAddressRepository } from '@/_repositories/user/user-address.repository';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { TUserAddress } from '@/_db/drizzle/schema';
import { CustomException } from '@/common/exceptions/custom.exception';

@Injectable()
export class SetDefaultAddressService {
  private readonly logger = new Logger(SetDefaultAddressService.name);

  constructor(
    private readonly addressRepository: UserAddressRepository,
    private readonly db: DrizzleService,
  ) {}

  async execute(addressId: string, userId: string): Promise<TUserAddress> {
    try {
      return await this.db.transaction(async (tx) => {
        const address = await this.addressRepository.findOne(
          { id: addressId, userId },
          { tx, lock: true },
        );

        if (!address) {
          throw CustomException.notFound({
            message: 'Address not found',
            details: 'No address found with the given ID for this user',
          });
        }

        await this.addressRepository.update(
          { isDefault: false },
          { userId, type: address.type },
          tx,
        );

        const [updated] = await this.addressRepository.update(
          { isDefault: true },
          { id: addressId, userId },
          tx,
        );

        if (!updated) {
          throw CustomException.databaseError({
            message: 'Failed to set default address',
          });
        }

        return updated;
      });
    } catch (error) {
      if (error instanceof CustomException) throw error;
      this.logger.error(
        `Failed to set default address ${addressId} for user ${userId}`,
        error,
      );
      throw error;
    }
  }
}
