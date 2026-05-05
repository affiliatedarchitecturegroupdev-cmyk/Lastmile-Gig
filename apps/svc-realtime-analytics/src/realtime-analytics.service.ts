import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface MetricSnapshot {
  id: string;
  metric: string;
  value: number;
  timestamp: Date;
  tags: Record<string, string>;
}

export interface RealTimeMetric {
  orders: number;
  revenue: number;
  activeDrivers: number;
  activeRestaurants: number;
  avgOrderValue: number;
  conversionRate: number;
}

@Injectable()
export class RealTimeAnalyticsService {
  private readonly logger = new Logger(RealTimeAnalyticsService.name);
  private metrics: Map<string, MetricSnapshot[]> = new Map();

  async getCurrentMetrics(): Promise<RealTimeMetric> {
    return { orders: 342, revenue: 89500, activeDrivers: 890, activeRestaurants: 450, avgOrderValue: 262, conversionRate: 0.12 };
  }

  async recordMetric(metric: string, value: number, tags?: Record<string, string>): Promise<void> {
    const snapshot: MetricSnapshot = { id: uuidv4(), metric, value, timestamp: new Date(), tags: tags || {} };
    const existing = this.metrics.get(metric) || [];
    existing.push(snapshot);
    this.metrics.set(metric, existing);
  }

  async getMetricHistory(metric: string, duration: string): Promise<MetricSnapshot[]> {
    return this.metrics.get(metric) || [];
  }
}