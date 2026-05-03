import { Injectable, NotFoundException } from '@nestjs/common';

export type DispatchStatus = 'pending' | 'assigned' | 'accepted' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';

export interface Dispatch {
  id: string;
  orderId: string;
  driverId: string | null;
  status: DispatchStatus;
  zoneId: string;
  assignedAt: Date | null;
  acceptedAt: Date | null;
  pickedUpAt: Date | null;
  deliveredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class DispatchService {
  private dispatches: Map<string, Dispatch> = new Map();

  async assignDriver(orderId: string, driverId: string): Promise<Dispatch> {
    const dispatch: Dispatch = {
      id: crypto.randomUUID(),
      orderId,
      driverId,
      status: 'assigned',
      zoneId: 'default',
      assignedAt: new Date(),
      acceptedAt: null,
      pickedUpAt: null,
      deliveredAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.dispatches.set(orderId, dispatch);
    return dispatch;
  }

  async batchAssign(orderIds: string[], driverId: string): Promise<Dispatch[]> {
    const results: Dispatch[] = [];
    for (const orderId of orderIds) {
      const dispatch = await this.assignDriver(orderId, driverId);
      results.push(dispatch);
    }
    return results;
  }

  async findAvailableDrivers(orderId: string): Promise<any[]> {
    return [];
  }

  async getDispatchStatus(orderId: string): Promise<Dispatch> {
    const dispatch = this.dispatches.get(orderId);
    if (!dispatch) throw new NotFoundException('Dispatch not found');
    return dispatch;
  }

  async reassignDriver(orderId: string, newDriverId: string): Promise<Dispatch> {
    const dispatch = await this.getDispatchStatus(orderId);
    dispatch.driverId = newDriverId;
    dispatch.status = 'assigned';
    dispatch.assignedAt = new Date();
    dispatch.updatedAt = new Date();
    return dispatch;
  }

  async getZoneOrders(zoneId: string): Promise<Dispatch[]> {
    return Array.from(this.dispatches.values()).filter(d => d.zoneId === zoneId);
  }

  async optimizeRoute(orderIds: string[]): Promise<{ order: string; sequence: number }[]> {
    return orderIds.map((orderId, index) => ({ order: orderId, sequence: index + 1 }));
  }
}