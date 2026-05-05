import { Injectable } from '@nestjs/common';

@Injectable()
export class PredictiveAnalyticsService {
  async predict(metric: string, steps: number): Promise<number[]> { return [100, 110, 120]; }
}