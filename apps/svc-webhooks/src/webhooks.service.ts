import { Injectable } from '@nestjs/common';

@Injectable()
export class WebhooksService {
  async registerWebhook(event: string, url: string): Promise<boolean> { return true; }
}