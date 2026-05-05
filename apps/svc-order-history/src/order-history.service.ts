import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderHistoryService {
  async getOrderHistory(userId: string, limit?: number): Promise<any[]> { return [{ id: 'o1', date: new Date(), total: 250, status: 'completed' }]; }
  async reorder(orderId: string): Promise<{ newOrderId: string }> { return { newOrderId: `o_${Date.now()}` }; }
  async getOrderDetails(orderId: string): Promise<any> { return { id: orderId, items: [{ name: 'Burger', qty: 2, price: 120 }], total: 250 }; }
}