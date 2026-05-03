import { Injectable } from '@nestjs/common';

export interface AllocationRule {
  id: string;
  zoneId: string;
  maxDistance: number;
  maxActiveOrders: number;
  priority: number;
}

@Injectable()
export class AllocationService {
  private rules: Map<string, AllocationRule> = new Map();

  async applyRules(orderId: string, drivers: any[]): Promise<any[]> {
    return drivers.filter(d => d.status === 'active' || d.status === 'idle');
  }

  async batchAllocate(orderIds: string[], drivers: any[]): Promise<Map<string, string>> {
    const allocation = new Map<string, string>();
    for (const orderId of orderIds) {
      const driver = await this.findBestDriver(orderId, drivers);
      if (driver) {
        allocation.set(orderId, driver.id);
        drivers = drivers.filter(d => d.id !== driver.id);
      }
    }
    return allocation;
  }

  async findBestDriver(orderId: string, drivers: any[]): Promise<any> {
    return drivers[0] || null;
  }

  async calculateCapacity(zoneId: string): Promise<{ available: number; total: number }> {
    return { available: 0, total: 0 };
  }
}