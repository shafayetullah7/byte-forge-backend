import { Injectable, Logger } from '@nestjs/common';
import { UserAddressRepository } from '@/_repositories/user/user-address.repository';
import { CustomException } from '@/common/exceptions/custom.exception';
import { eq } from 'drizzle-orm';
import { userAddressesTable } from '@/_db/drizzle/schema';

@Injectable()
export class DeleteAddressService {
  private readonly logger = new Logger(DeleteAddressService.name);

  constructor(private readonly addressRepository: UserAddressRepository) {}

  async execute(addressId: string, userId: string): Promise<void> {
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

      const deleted = await this.addressRepository.delete(
        eq(userAddressesTable.id, addressId),
      );

      if (!deleted) {
        throw CustomException.databaseError({
          message: 'Failed to delete address',
        });
      }
    } catch (error) {
      if (error instanceof CustomException) throw error;
      this.logger.error(
        `Failed to delete address ${addressId} for user ${userId}`,
        error,
      );
      throw error;
    }
  }
}
