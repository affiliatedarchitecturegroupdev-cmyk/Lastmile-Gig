import { Injectable } from '@nestjs/common';

@Injectable()
export class KYCVerificationService {
  async submitKYC(userId: string, documents: any[]): Promise<{ status: string }> { return { status: 'pending' }; }
}