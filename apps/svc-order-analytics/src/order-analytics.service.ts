import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderAnalyticsService {
  async getMetrics(period: string): Promise<{ orders: number; revenue: number; avgOrderValue: number }> { return { orders: 1250, revenue: 312500, avgOrderValue: 250 }; }
}