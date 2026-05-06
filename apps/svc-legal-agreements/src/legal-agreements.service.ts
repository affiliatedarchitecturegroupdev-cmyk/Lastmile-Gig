import { Injectable } from '@nestjs/common';

@Injectable()
export class LegalAgreementsService {
  async getAgreement(type: string): Promise<{ content: string }> { return { content: 'Agreement content...' }; }
}