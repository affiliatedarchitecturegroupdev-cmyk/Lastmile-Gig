import { Injectable } from '@nestjs/common';

@Injectable()
export class ReferralSystemService {
  async createReferralCode(userId: string): Promise<{ code: string }> { return { code: 'REF' + userId.slice(0, 4) }; }
}