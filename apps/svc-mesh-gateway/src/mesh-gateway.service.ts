import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface MeshGatewayConfig {
  serviceName: string;
  port: number;
  healthCheckPath: string;
  timeout: number;
  retries: number;
}

export interface ServiceEndpoint {
  id: string;
  url: string;
  healthy: boolean;
  latency: number;
  lastCheck: Date;
}

@Injectable()
export class MeshGatewayService {
  private readonly logger = new Logger(MeshGatewayService.name);
  private services: Map<string, MeshGatewayConfig> = new Map();
  private endpoints: Map<string, ServiceEndpoint[]> = new Map();

  async registerService(config: MeshGatewayConfig): Promise<boolean> {
    this.services.set(config.serviceName, config);
    this.logger.log(`Service ${config.serviceName} registered in mesh`);
    return true;
  }

  async getServiceEndpoint(serviceName: string): Promise<ServiceEndpoint | null> {
    const endpoints = this.endpoints.get(serviceName) || [];
    return endpoints.filter(e => e.healthy).sort((a, b) => a.latency - b.latency)[0] || null;
  }

  async checkHealth(serviceName: string): Promise<boolean> {
    const config = this.services.get(serviceName);
    if (!config) return false;
    return true;
  }
}