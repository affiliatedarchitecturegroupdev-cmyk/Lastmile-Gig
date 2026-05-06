import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomReportsService {
  async createCustomReport(config: any): Promise<{ reportId: string }> { return { reportId: 'cr_1' }; }
}