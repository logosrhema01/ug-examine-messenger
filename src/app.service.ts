import { Injectable } from '@nestjs/common';
import { MailingService } from './mailing/mailing.service';
import { ISendMailOptions } from '@nestjs-modules/mailer';
import { Address } from 'nodemailer/lib/mailer';
import { WhatsappService } from './whatsapp/whatsapp.service';

@Injectable()
export class AppService {
  constructor(
    private readonly _mailingService: MailingService,
    private readonly _whatsAppService: WhatsappService,
  ) {}

  async sendNotification(payload: ISendMailOptions) {
    const promises = [];

    // Check if payload.to is an array
    if (!Array.isArray(payload.to)) {
      promises.push(this.checkRecipientAndNext(payload.to, payload));
    } else {
      for (const to of payload.to) {
        promises.push(this.checkRecipientAndNext(to, payload));
      }
    }
    return await Promise.allSettled(promises);
  }

  private checkRecipientAndNext(
    to: string | Address,
    payload: ISendMailOptions,
  ) {
    const recipient = to.toString();
    if (recipient.startsWith('mail:')) {
      return this._mailingService.sendMessage({
        to: recipient.replace('mail:', ''),
        ...payload,
      });
    }
    // if (recipient.startsWith('sms:')) {
    //   return this._whatsAppService.sendMessage({
    //     to: recipient.replace('sms:', ''),
    //     ...payload,
    //   });
    // }
  }
}
