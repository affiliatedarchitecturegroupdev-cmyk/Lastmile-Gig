import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportGeneratorService {
  async generateReport(config: any): Promise<{ reportId: string }> { return { reportId: 'rpt_1' }; }
}