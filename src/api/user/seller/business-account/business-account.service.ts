import { ConflictException, Injectable } from '@nestjs/common';
import { CreateBusinessAccountDto } from './dto/setup.business.dto';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { BusinessAccountRepository } from '@/_repositories/business/business.account.repository';
import { MediaService } from '@/api/media/media.service';
import { AllowedMimeType, TAllowedMimeType } from '@/_db/drizzle/enum';
import { TBusinessAccount } from '@/_db/drizzle/schema';

@Injectable()
export class BusinessAccountService {
  constructor(
    private readonly db: DrizzleService,
    private readonly businessAccountRepository: BusinessAccountRepository,
    private readonly mediaService: MediaService,
  ) {}

  async createBusinessAccount(
    payload: CreateBusinessAccountDto,
    userId: string,
  ) {
    const { basicInfo } = payload;
    const result = this.db.transaction(async (tx) => {
      const existingAccount =
        await this.businessAccountRepository.findBusinessAccountByOwnerId(
          userId,
          { tx, lock: false },
        );

      if (existingAccount) {
        throw new ConflictException('You already have a business account');
      }

      if (basicInfo.logoId) {
        const mediaIds = [basicInfo.logoId];
        const validMimeTypes: TAllowedMimeType[] = [
          AllowedMimeType.JPEG,
          AllowedMimeType.PNG,
        ];
        await this.mediaService.useMedia(
          { mediaIds, userId, validMimeTypes },
          tx,
        );
      }

      const newAccount =
        await this.businessAccountRepository.createBusinessAccount(
          {
            ownerId: userId,
            address: basicInfo.address,
            name: basicInfo.name,
            ...(basicInfo.logoId && { logo: basicInfo.logoId }),
          },
          tx,
        );

      return newAccount;
    });
    return result;
  }

  async getBusiness(userId: string): Promise<TBusinessAccount | null> {
    const businessAccount =
      await this.businessAccountRepository.findBusinessAccountByOwnerId(userId);

    return businessAccount;
  }
}
