import { Injectable } from '@nestjs/common';

@Injectable()
export class BusinessIntelligenceService {
  async generateReport(type: string): Promise<any> { return { insights: [] }; }
}