import { Injectable } from '@nestjs/common';

@Injectable()
export class InstallmentPaymentsService {
  async calculateInstallments(amount: number, months: number): Promise<{ monthly: number; total: number }> { return { monthly: amount / months, total: amount }; }
}