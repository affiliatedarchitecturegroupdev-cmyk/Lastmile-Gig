import { Injectable } from '@nestjs/common';

@Injectable()
export class ComplianceTrackerService {
  async getComplianceStatus(): Promise<{ status: string; lastAudit: Date }> { return { status: 'compliant', lastAudit: new Date() }; }
}