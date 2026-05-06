import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricsAggregatorService {
  async aggregate(metrics: string[], interval: string): Promise<any> { return { orders: 100, revenue: 25000 }; }
}