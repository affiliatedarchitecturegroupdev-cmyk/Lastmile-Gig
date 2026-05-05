import { Injectable } from '@nestjs/common';

@Injectable()
export class ChargebackHandlerService {
  async processChargeback(data: { transactionId: string; amount: number; reason: string }): Promise<boolean> { return true; }
}