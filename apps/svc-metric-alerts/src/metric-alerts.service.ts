import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricAlertsService {
  async checkThresholds(metric: string): Promise<boolean> { return false; }
}