import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportSharingService {
  async shareReport(reportId: string, recipient: string): Promise<{ shareUrl: string }> { return { shareUrl: 'https://...' }; }
}