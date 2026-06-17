import { BadRequestException, Injectable } from '@nestjs/common';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { PaymentMethodRepository } from '@/_repositories/payment/payment-method.repository';
import { MediaRepository } from '@/_repositories/providers/media/media.repository/media.repository';
import { CreatePaymentMethodDto } from '../dto/create-payment-method.dto';
import {
  PaymentMethodResponse,
  toPaymentMethodResponse,
} from '../response/payment-method-response.mapper';
import { PaymentMethodLogoService } from './payment-method-logo.service';

@Injectable()
export class CreatePaymentMethodService {
  constructor(
    private readonly repository: PaymentMethodRepository,
    private readonly logoService: PaymentMethodLogoService,
    private readonly mediaRepository: MediaRepository,
    private readonly db: DrizzleService,
  ) {}

  async execute(
    dto: CreatePaymentMethodDto,
    adminId: string,
  ): Promise<PaymentMethodResponse> {
    const existing = await this.repository.findByKey(dto.key);

    if (existing) {
      throw new BadRequestException(
        `Payment method with key '${dto.key}' already exists`,
      );
    }

    const row = await this.db.client.transaction(async (tx) => {
      if (dto.logoId) {
        await this.logoService.validateLogoId(dto.logoId, adminId, tx);
        await this.mediaRepository.incrementMediaUsage([dto.logoId], tx);
      }

      return this.repository.create(
        {
          key: dto.key,
          displayName: dto.displayName,
          logoId: dto.logoId ?? null,
          description: dto.description ?? null,
          status: 'INACTIVE',
        },
        tx,
      );
    });

    return toPaymentMethodResponse(row);
  }
}
