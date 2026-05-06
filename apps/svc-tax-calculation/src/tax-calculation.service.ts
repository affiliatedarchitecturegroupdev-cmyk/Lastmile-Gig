import { Injectable } from '@nestjs/common';

@Injectable()
export class TaxCalculationService {
  async calculateTax(amount: number, region: string): Promise<{ tax: number; total: number }> { return { tax: amount * 0.15, total: amount * 1.15 }; }
}