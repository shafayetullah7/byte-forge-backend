import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBusinessAccountDto } from './dto/setup.business.dto';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { BusinessAccountRepository } from '@/_repositories/business/business.account.repository';
import { MediaService } from '@/api/media/media.service';
import { AllowedMimeType, TAllowedMimeType } from '@/_db/drizzle/enum';
import {
  businessAccountTable,
  mediaTable,
  TBusinessAccount,
  TMedia,
  TNewBusinessAccount,
} from '@/_db/drizzle/schema';
import { eq, getTableColumns } from 'drizzle-orm';

type BusinessAccountDetails = TBusinessAccount & {
  logo: Pick<TMedia, 'id' | 'url' | 'mimeType' | 'fileName' | 'size'> | null;
};

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

      const businessAccountPayload: TNewBusinessAccount = {
        ownerId: userId,
        address: basicInfo.address,
        name: basicInfo.name,
        ...(basicInfo.logoId ? { logoId: basicInfo.logoId } : {}),
      };

      const newAccount =
        await this.businessAccountRepository.createBusinessAccount(
          businessAccountPayload,
          tx,
        );

      return newAccount;
    });
    return result;
  }

  async getBusiness(userId: string): Promise<TBusinessAccount> {
    const baseQuery = this.db.client
      .select({
        businessAccount: getTableColumns(businessAccountTable),
        logo: getTableColumns(mediaTable),
      })
      .from(businessAccountTable)
      .leftJoin(mediaTable, eq(businessAccountTable.logoId, mediaTable.id))
      .where(eq(businessAccountTable.ownerId, userId));

    const [account] = await baseQuery.execute();

    if (!account?.businessAccount) {
      throw new NotFoundException('Business account not found');
    }

    const { businessAccount, logo } = account;

    const result: BusinessAccountDetails = {
      ...businessAccount,
      logo: logo
        ? {
            id: logo?.id,
            url: logo?.url,
            mimeType: logo?.mimeType,
            fileName: logo?.fileName,
            size: logo?.size,
          }
        : null,
    };
    return result;
  }
}
