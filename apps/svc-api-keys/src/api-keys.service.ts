import { Injectable } from '@nestjs/common';

@Injectable()
export class APIKeysService {
  async generateAPIKey(userId: string): Promise<{ apiKey: string }> { return { apiKey: 'sk_live_' + Math.random().toString(36).slice(2) }; }
}