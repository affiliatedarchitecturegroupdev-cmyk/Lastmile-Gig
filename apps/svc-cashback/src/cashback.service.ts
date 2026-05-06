import { Injectable } from '@nestjs/common';

@Injectable()
export class CashbackService {
  async calculateCashback(userId: string, amount: number): Promise<number> { return amount * 0.05; }
}