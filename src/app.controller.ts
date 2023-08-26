import { Controller, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { ISendMailOptions } from '@nestjs-modules/mailer';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('notify')
  sendNotification(
    @Body()
    body: {
      payload: ISendMailOptions;
    },
  ) {
    return this.appService.sendNotification(body.payload);
  }
}
