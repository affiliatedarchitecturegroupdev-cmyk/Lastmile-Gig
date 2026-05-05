import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export type OrderStatus = 'new' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface PartnerOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  items: { name: string; quantity: number; price: number; notes?: string }[];
  total: number;
  status: OrderStatus;
  paymentStatus: 'paid' | 'pending';
  orderType: 'delivery' | 'pickup';
  placedAt: Date;
  estimatedReadyAt?: Date;
}

@Injectable()
export class OrderHandlingService {
  private orders: Map<string, PartnerOrder[]> = new Map();

  /**
   * Get pending orders
   */
  async getPendingOrders(partnerId: string): Promise<PartnerOrder[]> {
    const orders = this.orders.get(partnerId) || [];
    return orders.filter(o => 
      o.status === 'new' || o.status === 'confirmed' || o.status === 'preparing'
    );
  }

  /**
   * Accept order
   */
  async acceptOrder(partnerId: string, orderId: string): Promise<PartnerOrder | null> {
    const orders = this.orders.get(partnerId) || [];
    const order = orders.find(o => o.id === orderId);
    
    if (order && order.status === 'new') {
      order.status = 'confirmed';
      order.estimatedReadyAt = new Date(Date.now() + 15 * 60 * 1000);
      this.orders.set(partnerId, orders);
      return order;
    }
    return null;
  }

  /**
   * Mark as preparing
   */
  async startPreparing(partnerId: string, orderId: string): Promise<PartnerOrder | null> {
    const orders = this.orders.get(partnerId) || [];
    const order = orders.find(o => o.id === orderId);
    
    if (order && order.status === 'confirmed') {
      order.status = 'preparing';
      this.orders.set(partnerId, orders);
      return order;
    }
    return null;
  }

  /**
   * Mark as ready
   */
  async markReady(partnerId: string, orderId: string): Promise<PartnerOrder | null> {
    const orders = this.orders.get(partnerId) || [];
    const order = orders.find(o => o.id === orderId);
    
    if (order && order.status === 'preparing') {
      order.status = 'ready';
      this.orders.set(partnerId, orders);
      return order;
    }
    return null;
  }

  /**
   * Complete order
   */
  async completeOrder(partnerId: string, orderId: string): Promise<PartnerOrder | null> {
    const orders = this.orders.get(partnerId) || [];
    const order = orders.find(o => o.id === orderId);
    
    if (order && order.status === 'ready') {
      order.status = 'completed';
      this.orders.set(partnerId, orders);
      return order;
    }
    return null;
  }

  /**
   * Cancel order
   */
  async cancelOrder(partnerId: string, orderId: string, reason?: string): Promise<PartnerOrder | null> {
    const orders = this.orders.get(partnerId) || [];
    const order = orders.find(o => o.id === orderId);
    
    if (order && (order.status === 'new' || order.status === 'confirmed')) {
      order.status = 'cancelled';
      this.orders.set(partnerId, orders);
      return order;
    }
    return null;
  }

  /**
   * Get order history
   */
  async getOrderHistory(
    partnerId: string,
    limit: number = 50
  ): Promise<PartnerOrder[]> {
    const orders = this.orders.get(partnerId) || [];
    return orders.slice(-limit).reverse();
  }

  /**
   * Get today's stats
   */
  async getTodaysStats(partnerId: string): Promise<{
    orders: number;
    revenue: number;
    avgPrepTime: number;
    cancellations: number;
  }> {
    const orders = this.orders.get(partnerId) || [];
    const today = new Date().toDateString();
    const todayOrders = orders.filter(o => 
      o.placedAt.toDateString() === today
    );

    return {
      orders: todayOrders.length,
      revenue: todayOrders.reduce((sum, o) => sum + o.total, 0),
      avgPrepTime: 18,
      cancellations: todayOrders.filter(o => o.status === 'cancelled').length,
    };
  }

  /**
   * Update estimated time
   */
  async updateEstimatedTime(
    partnerId: string,
    orderId: string,
    minutes: number
  ): Promise<boolean> {
    const orders = this.orders.get(partnerId) || [];
    const order = orders.find(o => o.id === orderId);
    
    if (order) {
      order.estimatedReadyAt = new Date(Date.now() + minutes * 60 * 1000);
      this.orders.set(partnerId, orders);
      return true;
    }
    return false;
  }

  /**
   * Get ready orders count
   */
  async getReadyCount(partnerId: string): Promise<number> {
    const orders = this.orders.get(partnerId) || [];
    return orders.filter(o => o.status === 'ready').length;
  }
}