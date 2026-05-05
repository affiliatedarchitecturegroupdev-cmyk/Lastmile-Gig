import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderStatusService {
  private statuses = ['placed', 'confirmed', 'preparing', 'ready', 'picked_up', 'en_route', 'arrived', 'delivered', 'completed'];
  private current = new Map<string, string>();

  async updateStatus(orderId: string, status: string): Promise<{ success: boolean; previousStatus: string; newStatus: string }> {
    const prev = this.current.get(orderId) || 'placed';
    this.current.set(orderId, status);
    return { success: true, previousStatus: prev, newStatus: status };
  }

  async getStatus(orderId: string): Promise<string> { return this.current.get(orderId) || 'placed'; }
  async getAllStatuses(): Promise<string[]> { return this.statuses; }
  async getStatusTimeline(orderId: string): Promise<{ status: string; timestamp: Date }[]> { return [{ status: 'placed', timestamp: new Date() }]; }
  async isValidTransition(from: string, to: string): Promise<boolean> { return this.statuses.indexOf(to) > this.statuses.indexOf(from); }
}