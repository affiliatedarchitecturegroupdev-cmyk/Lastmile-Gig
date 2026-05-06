import { Injectable } from '@nestjs/common';

@Injectable()
export class VirtualCardsService {
  async createVirtualCard(userId: string): Promise<{ cardId: string; last4: string }> { return { cardId: 'vc_1', last4: '4242' }; }
}