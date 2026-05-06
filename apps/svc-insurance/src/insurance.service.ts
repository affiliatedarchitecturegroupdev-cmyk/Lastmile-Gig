import { Injectable } from '@nestjs/common';

@Injectable()
export class InsuranceService {
  async purchaseInsurance(orderId: string, coverage: number): Promise<{ policyId: string }> { return { policyId: 'ins_1' }; }
}