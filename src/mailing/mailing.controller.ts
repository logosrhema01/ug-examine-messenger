import { Body, Controller, Post } from '@nestjs/common';
import { ISendMailOptions } from '@nestjs-modules/mailer';
import { MailingService } from './mailing.service';

@Controller('mailing')
export class MailingController {
  constructor(readonly mailingService: MailingService) {}

  @Post()
  sendMessage(
    @Body()
    body: {
      payload: ISendMailOptions;
    },
  ) {
    return this.mailingService.sendMessage(body.payload);
  }
}
