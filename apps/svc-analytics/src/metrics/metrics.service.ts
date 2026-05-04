import { Injectable } from '@nestjs/common';

export interface MetricValue {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
}

@Injectable()
export class MetricsService {
  private metrics: Map<string, MetricValue[]> = new Map();

  async record(name: string, value: number, unit = 'count'): Promise<void> {
    const metric: MetricValue = {
      name,
      value,
      unit,
      timestamp: new Date(),
    };

    const values = this.metrics.get(name) || [];
    values.push(metric);
    
    // Keep last 1000 values
    if (values.length > 1000) {
      values.shift();
    }
    
    this.metrics.set(name, values);
  }

  async get(name: string, duration = 3600): Promise<{ time: Date; value: number }[]> {
    const cutoff = new Date(Date.now() - duration * 1000);
    const values = this.metrics.get(name) || [];
    
    return values
      .filter(v => v.timestamp > cutoff)
      .map(v => ({ time: v.timestamp, value: v.value }));
  }

  async getAverage(name: string, duration = 3600): Promise<number> {
    const values = await this.get(name, duration);
    if (values.length === 0) return 0;
    return values.reduce((s, v) => s + v.value, 0) / values.length;
  }

  async getSum(name: string, duration = 3600): Promise<number> {
    const values = await this.get(name, duration);
    return values.reduce((s, v) => s + v.value, 0);
  }

  async getP95(name: string, duration = 3600): Promise<number> {
    const values = await this.get(name, duration);
    if (values.length === 0) return 0;
    
    const sorted = values.map(v => v.value).sort((a, b) => a - b);
    const idx = Math.floor(sorted.length * 0.95);
    return sorted[idx];
  }

  async getGauge(name: string): Promise<number> {
    const values = this.metrics.get(name) || [];
    return values.length > 0 ? values[values.length - 1].value : 0;
  }

  async increment(name: string): Promise<void> {
    await this.record(name, 1);
  }

  async timing(name: string, durationMs: number): Promise<void> {
    await this.record(name, durationMs, 'ms');
  }
}