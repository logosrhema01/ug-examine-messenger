import { ISendMailOptions } from '@nestjs-modules/mailer';
import { HttpService } from '@nestjs/axios';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { tap } from 'rxjs';

@Injectable()
export class WhatsappService {
  constructor(private httpService: HttpService) {}

  /**
   * const axios = require('axios').default;

    const options = {
      method: 'POST',
      url: 'https://api-teams.chatdaddy.tech/token',
      headers: {'Content-Type': 'application/json', Accept: 'application/json'},
      data: {phoneNumber: 9122321223, password: 'abcd', scopes: ['WA_LIVE_EVENTS']}
    };

    try {
      const { data } = await axios.request(options);
      console.log(data);
    } catch (error) {
      console.error(error);
    }
   */
  async sendMessage(data: ISendMailOptions) {
    if (!data.to) {
      throw new Error('No recipient provided');
    }
    const recipients = Array.isArray(data.to) ? data.to : [data.to];
    recipients.filter((recipient) => {
      const stringRecipient = recipient.toString();
      if (!stringRecipient.startsWith('sms:')) return false;
      return true;
    });

    for (let recipient of recipients) {
      recipient = recipient.toString().replace('sms:', '');
      console.log(
        '🚀 ~ file: whatsapp.service.ts:39 ~ WhatsappService ~ sendMessage ~ recipient:',
        recipient,
      );
      const accessToken = await this._getAccessToken();
      const options = {
        method: 'POST',
        url: `https://api-im.chatdaddy.tech/messages/random/${recipient}@s.whatsapp.net`,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: 'Bearer ' + accessToken,
        },
        data: { text: data.context.message },
      };

      try {
        await this.httpService.request(options).toPromise();
      } catch (error) {
        console.error(error);
        throw new ServiceUnavailableException('Error sending message');
      }
    }
  }

  private async _getAccessToken() {
    const options = {
      method: 'POST',
      url: 'https://api-teams.chatdaddy.tech/token',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      data: {
        phoneNumber: parseInt(process.env.CHATDADDY_PHONE_NUMBER),
        // Base64 encoded SHA256 of the plaintext
        password: process.env.CHATDADDY_PASSWORD,
        scopes: ['MESSAGES_SEND_TO_ASSIGNED', 'MESSAGES_SEND_TO_ALL'],
      },
    };

    try {
      const { data } = await this.httpService
        .request(options)
        // Return the access token
        .toPromise();
      return data.access_token;
    } catch (error) {
      console.error(error);
    }
  }

  private async retrieveAccessToken(res: { data: any }) {
    const accessToken = res.data.access_token;
    return accessToken;
  }
}
