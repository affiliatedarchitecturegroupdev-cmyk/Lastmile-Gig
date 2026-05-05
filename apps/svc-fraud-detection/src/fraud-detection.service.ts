import { Injectable, Logger } from '@nestjs/common';

export interface FraudCheckResult {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  flags: string[];
  recommendation: 'allow' | 'review' | 'block';
}

@Injectable()
export class FraudDetectionService {
  private readonly logger = new Logger(FraudDetectionService.name);

  async checkTransaction(data: { userId: string; amount: number; cardLast4?: string; ip?: string; location?: any }): Promise<FraudCheckResult> {
    let riskScore = 0;
    const flags: string[] = [];

    if (data.amount > 5000) { riskScore += 30; flags.push('high_value'); }
    if (data.amount > 10000) { riskScore += 40; flags.push('very_high_value'); }

    const riskLevel = riskScore > 70 ? 'high' : riskScore > 40 ? 'medium' : 'low';
    const recommendation = riskScore > 70 ? 'block' : riskScore > 40 ? 'review' : 'allow';

    this.logger.log(`Fraud check: score=${riskScore}, recommendation=${recommendation}`);
    return { riskScore, riskLevel, flags, recommendation };
  }

  async checkVelocity(userId: string, windowMinutes: number): Promise<{ count: number; flagged: boolean }> {
    return { count: 3, flagged: false };
  }
}