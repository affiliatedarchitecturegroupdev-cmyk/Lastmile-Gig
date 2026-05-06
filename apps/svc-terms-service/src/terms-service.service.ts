import { Injectable } from '@nestjs/common';

@Injectable()
export class TermsServiceService {
  async acceptTerms(userId: string, version: string): Promise<boolean> { return true; }
}