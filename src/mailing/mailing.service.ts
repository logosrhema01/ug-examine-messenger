import { MailerService, ISendMailOptions } from '@nestjs-modules/mailer';
import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { Options } from 'nodemailer/lib/smtp-transport';

@Injectable()
export class MailingService {
  private readonly _logger = new Logger(MailingService.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  async sendMessage(payload: ISendMailOptions) {
    return await this._sendMail(payload);
  }

  private async _sendMail(payload: ISendMailOptions) {
    try {
      await this._setTransport();
      const success = await this.mailerService.sendMail({
        transporterName: 'gmail',
        to: payload.to, // list of receivers
        subject: payload.subject, // Subject line
        template: 'action',
        context: {
          // Data to be sent to template engine..
          ...payload.context,
        },
        // text: payload.context.code,
        attachments: payload.attachments,
      });
      return {
        success: true,
        accepted: success.accepted,
        rejected: success.rejected,
        messageId: success.messageId,
      };
    } catch (error) {
      this._logger.error(error);
      throw new ServiceUnavailableException('Error sending email');
    }
  }

  private async _setTransport() {
    try {
      const OAuth2 = google.auth.OAuth2;
      const oauth2Client = new OAuth2(
        this.configService.get('CLIENT_ID'),
        this.configService.get('CLIENT_SECRET'),
        'https://developers.google.com/oauthplayground',
      );
      oauth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN,
      });
      const accessToken: string = await new Promise((resolve) => {
        oauth2Client.getAccessToken((err, token) => {
          if (err) {
            throw new ServiceUnavailableException('Error getting access token');
          }
          resolve(token);
        });
      });

      const config: Options = {
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: this.configService.get('EMAIL'),
          clientId: this.configService.get('CLIENT_ID'),
          clientSecret: this.configService.get('CLIENT_SECRET'),
          accessToken,
          // accessUrl: 'https://oauth2.googleapis.com/token',
        },
      };
      this.mailerService.addTransporter('gmail', config);
    } catch (error) {
      throw new Error(error);
    }
  }
}
