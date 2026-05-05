import { Injectable } from '@nestjs/common';

@Injectable()
export class SavedCardsService {
  async saveCard(userId: string, token: string): Promise<boolean> { return true; }
}