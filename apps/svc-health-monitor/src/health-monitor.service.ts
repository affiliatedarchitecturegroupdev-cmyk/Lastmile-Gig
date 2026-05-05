import { Injectable, Logger } from '@nestjs/common';

export interface HealthStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
  checks: any;
}

@Injectable()
export class HealthMonitorService {
  private readonly logger = new Logger(HealthMonitorService.name);
  private statuses: Map<string, HealthStatus> = new Map();

  async checkHealth(service: string): Promise<HealthStatus> {
    return { service, status: 'healthy', latency: 45, checks: {} };
  }

  async getAllHealth(): Promise<HealthStatus[]> { return Array.from(this.statuses.values()); }
}