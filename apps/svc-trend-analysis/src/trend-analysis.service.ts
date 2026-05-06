import { Injectable } from '@nestjs/common';

@Injectable()
export class TrendAnalysisService {
  async analyzeTrends(metric: string): Promise<{ direction: string; change: number }> { return { direction: 'up', change: 0.1 }; }
}