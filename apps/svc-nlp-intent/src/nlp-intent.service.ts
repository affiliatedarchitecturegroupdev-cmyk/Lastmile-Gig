import { Injectable } from '@nestjs/common';

@Injectable()
export class NLPIntentService {
  async detectIntent(text: string): Promise<{ intent: string; confidence: number }> { return { intent: 'order_food', confidence: 0.9 }; }
}