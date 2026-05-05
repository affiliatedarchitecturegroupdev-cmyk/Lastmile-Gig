import { Injectable } from '@nestjs/common';

@Injectable()
export class CorporateBillingService {
  async createAccount(data: { companyName: string; taxId: string }): Promise<{ accountId: string }> { return { accountId: 'corp_1' }; }
}