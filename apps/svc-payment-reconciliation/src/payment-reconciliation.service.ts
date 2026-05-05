import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentReconciliationService {
  async reconcile(startDate: Date, endDate: Date): Promise<{ matched: number; unmatched: number }> { return { matched: 100, unmatched: 2 }; }
}