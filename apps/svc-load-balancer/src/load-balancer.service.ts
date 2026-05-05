import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoadBalancerService {
  private readonly logger = new Logger(LoadBalancerService.name);
  private backends: Map<string, { url: string; weight: number }[]> = new Map();

  async registerBackend(service: string, url: string, weight: number): Promise<boolean> {
    const existing = this.backends.get(service) || [];
    existing.push({ url, weight });
    this.backends.set(service, existing);
    return true;
  }

  async getNextBackend(service: string): Promise<string | null> {
    const backends = this.backends.get(service);
    if (!backends?.length) return null;
    // Simple round-robin
    return backends[Date.now() % backends.length].url;
  }
}