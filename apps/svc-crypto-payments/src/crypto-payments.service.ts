import { Injectable } from '@nestjs/common';

@Injectable()
export class CryptoPaymentsService {
  async createInvoice(amount: number, currency: string): Promise<{ address: string; amount: number }> { return { address: 'bc1q...', amount }; }
}