import { Injectable } from '@nestjs/common';

@Injectable()
export class VoiceOrderingService {
  async processVoiceOrder(audioUrl: string): Promise<{ order: any }> { return { order: { items: [] } }; }
}