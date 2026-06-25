import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { AppEnvService } from '@/_config/app-env/app-env.service';
import { EmailService } from '@/common/modules/email/email.service';
import type {
  OrderPlacedEvent,
  OrderStatusChangedEvent,
  ShopVerificationDecidedEvent,
  ShopVerificationSubmittedEvent,
} from '@/common/modules/events/events';
import {
  resolveOrderEmailRecipient,
  resolveOrderEmailTemplateKey,
} from '@/common/modules/notifications/utils/resolve-order-email-recipient.util';
import type { ResolvedRecipient } from './notification-recipient.service';

@Injectable()
export class TransactionalEmailService {
  constructor(
    private readonly emailService: EmailService,
    private readonly i18n: I18nService,
    private readonly appEnv: AppEnvService,
  ) {}

  get frontendUrl(): string {
    return this.appEnv.FRONTEND_URL.replace(/\/$/, '');
  }

  async sendOrderPlacedBuyer(
    recipient: ResolvedRecipient,
    event: OrderPlacedEvent,
  ): Promise<void> {
    const { payload } = event;
    const orderList = payload.orders
      .map((o) => `• ${o.orderNumber} (${o.shopName}) — ৳${o.total}`)
      .join('\n');

    await this.sendTemplate(recipient, 'orderPlacedBuyer', {
      orderGroupId: payload.orderGroupId,
      totalAmount: payload.totalAmount,
      orderList,
      orderCount: String(payload.orders.length),
      viewOrdersUrl: `${this.frontendUrl}/app/orders`,
    });
  }

  async sendOrderPlacedSeller(
    recipient: ResolvedRecipient,
    order: OrderPlacedEvent['payload']['orders'][number],
  ): Promise<void> {
    await this.sendTemplate(recipient, 'orderPlacedSeller', {
      orderNumber: order.orderNumber,
      shopName: order.shopName,
      total: order.total,
      viewOrderUrl: `${this.frontendUrl}/app/seller/orders/${order.orderId}`,
    });
  }

  async sendOrderStatusChanged(
    recipient: ResolvedRecipient,
    event: OrderStatusChangedEvent,
    templateKey: string,
  ): Promise<void> {
    const { payload } = event;
    const isSellerRecipient =
      resolveOrderEmailRecipient(payload) === 'seller';

    const viewOrderUrl = isSellerRecipient
      ? `${this.frontendUrl}/app/seller/orders/${payload.orderId}`
      : `${this.frontendUrl}/app/orders/${payload.orderId}`;

    await this.sendTemplate(recipient, templateKey, {
      orderNumber: payload.orderNumber,
      fromStatus: payload.fromStatus,
      toStatus: payload.toStatus,
      notes: payload.notes ?? '',
      viewOrderUrl,
    });
  }

  async sendVerificationSubmitted(
    recipient: ResolvedRecipient,
    event: ShopVerificationSubmittedEvent,
  ): Promise<void> {
    await this.sendTemplate(recipient, 'shopVerificationSubmitted', {
      viewShopUrl: `${this.frontendUrl}/app/seller/my-shop`,
    });
  }

  async sendVerificationDecided(
    recipient: ResolvedRecipient,
    event: ShopVerificationDecidedEvent,
  ): Promise<void> {
    const templateKey =
      event.payload.decision === 'approved'
        ? 'shopVerificationApproved'
        : 'shopVerificationRejected';

    await this.sendTemplate(recipient, templateKey, {
      reason: event.payload.reason ?? '',
      viewShopUrl: `${this.frontendUrl}/app/seller/my-shop`,
      publicShopUrl: `${this.frontendUrl}/shops`,
    });
  }

  resolveOrderTemplateKey(event: OrderStatusChangedEvent): string | null {
    return resolveOrderEmailTemplateKey(event.payload);
  }

  private async sendTemplate(
    recipient: ResolvedRecipient,
    templateKey: string,
    args: Record<string, string>,
  ): Promise<void> {
    const lang = recipient.lang;
    const base = `message.email.transactional.${templateKey}`;
    const subject = this.i18n.t(`${base}.subject`, { lang, args });
    const greeting = this.i18n.t(`${base}.greeting`, { lang, args });
    const body = this.i18n.t(`${base}.body`, { lang, args });
    const cta = this.i18n.t(`${base}.cta`, { lang, args });
    const footer = this.i18n.t(`${base}.footer`, { lang, args });

    const viewOrderUrl = args.viewOrderUrl ?? args.viewOrdersUrl ?? '';
    const ctaHtml = viewOrderUrl
      ? `<p><a href="${viewOrderUrl}" style="display:inline-block;padding:12px 24px;background:#2d5a3d;color:#fff;text-decoration:none;border-radius:6px;">${cta}</a></p>`
      : '';

    const text = `${greeting}\n\n${body}\n\n${cta}${viewOrderUrl ? `: ${viewOrderUrl}` : ''}\n\n${footer}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <p>${greeting}</p>
        <p>${body}</p>
        ${ctaHtml}
        <p style="color: #999; font-size: 12px; margin-top: 24px;">${footer}</p>
      </div>
    `;

    await this.emailService.sendTransactionalEmail({
      to: recipient.email,
      subject,
      text,
      html,
    });
  }
}
