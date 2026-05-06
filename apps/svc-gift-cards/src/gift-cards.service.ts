import { Injectable } from '@nestjs/common';

@Injectable()
export class GiftCardsService {
  async createGiftCard(amount: number): Promise<{ code: string }> { return { code: 'GC' + Math.random().toString(36).slice(2) }; }
}