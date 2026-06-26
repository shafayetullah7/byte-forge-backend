import { Injectable, HttpStatus } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { productsTable } from '@/_db/drizzle/schema';
import { ProductStatusEnum } from '@/_db/drizzle/enum';
import { I18nService } from 'nestjs-i18n';
import { CustomException } from '@/common/exceptions/custom.exception';
import { ErrorCode } from '@/common/modules/response/dto/error.schema';

@Injectable()
export class DeletePlantService {
  constructor(
    private readonly db: DrizzleService,
    private readonly i18n: I18nService,
  ) {}

  async execute(shopId: string, plantId: string, lang: string) {
    return this.db.transaction(async (tx) => {
      const product = await tx.query.productsTable.findFirst({
        where: and(
          eq(productsTable.id, plantId),
          eq(productsTable.shopId, shopId),
          eq(productsTable.productType, 'plant'),
        ),
      });

      if (!product) {
        throw new CustomException({
          message: this.i18n.t('message.error.plantNotFound', { lang }),
          statusCode: HttpStatus.NOT_FOUND,
          errorCode: ErrorCode.NOT_FOUND,
        });
      }

      if (product.status === ProductStatusEnum.ARCHIVED) {
        return { id: product.id, status: product.status };
      }

      const [updated] = await tx
        .update(productsTable)
        .set({ status: ProductStatusEnum.ARCHIVED })
        .where(eq(productsTable.id, plantId))
        .returning({ id: productsTable.id, status: productsTable.status });

      return updated;
    });
  }
}
