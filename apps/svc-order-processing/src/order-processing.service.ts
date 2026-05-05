import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  modifiers: OrderModifier[];
  specialInstructions?: string;
  subtotal: number;
}

export interface OrderModifier {
  id: string;
  name: string;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  discount: number;
  tip: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryAddress: Address;
  estimatedDeliveryTime: Date;
  actualDeliveryTime?: Date;
  createdAt: Date;
  updatedAt: Date;
  assignedDriverId?: string;
  placedAt?: Date;
  confirmedAt?: Date;
  preparingAt?: Date;
  readyAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'en_route' | 'delivered' | 'cancelled';
export type PaymentMethod = 'card' | 'cash' | 'wallet' | 'gigapass';
export type PaymentStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';

export interface Address {
  street: string;
  apartment?: string;
  city: string;
  province: string;
  zipCode: string;
  lat: number;
  lng: number;
  instructions?: string;
}

export interface OrderFilter {
  status?: OrderStatus[];
  restaurantId?: string;
  userId?: string;
  driverId?: string;
  startDate?: Date;
  endDate?: Date;
  minTotal?: number;
  maxTotal?: number;
}

export interface BulkUpdateRequest {
  orderIds: string[];
  status?: OrderStatus;
  driverId?: string;
  notes?: string;
}

@Injectable()
export class OrderProcessingService {
  private readonly logger = new Logger(OrderProcessingService.name);
  private orders: Map<string, Order> = new Map();
  private orderItems: Map<string, OrderItem[]> = new Map();

  /**
   * Create a new order with validation
   */
  async createOrder(data: {
    userId: string;
    restaurantId: string;
    items: { menuItemId: string; name: string; quantity: number; price: number; modifiers?: { id: string; name: string; price: number }[]; specialInstructions?: string }[];
    deliveryAddress: Address;
    paymentMethod: PaymentMethod;
    tip?: number;
    couponCode?: string;
  }): Promise<Order> {
    const orderId = uuidv4();
    const now = new Date();

    // Calculate item totals
    const items: OrderItem[] = data.items.map(item => {
      const modifiers = item.modifiers || [];
      const modifierTotal = modifiers.reduce((sum, m) => sum + m.price, 0);
      const itemTotal = (item.price + modifierTotal) * item.quantity;
      return {
        id: uuidv4(),
        menuItemId: item.menuItemId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        modifiers,
        specialInstructions: item.specialInstructions,
        subtotal: itemTotal,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const deliveryFee = 35;
    const serviceFee = Math.round(subtotal * 0.05);
    const discount = 0;
    const tip = data.tip || 0;
    const total = subtotal + deliveryFee + serviceFee - discount + tip;

    const order: Order = {
      id: orderId,
      userId: data.userId,
      restaurantId: data.restaurantId,
      items,
      status: 'pending',
      subtotal,
      deliveryFee,
      serviceFee,
      discount,
      tip,
      total,
      paymentMethod: data.paymentMethod,
      paymentStatus: 'pending',
      deliveryAddress: data.deliveryAddress,
      estimatedDeliveryTime: new Date(now.getTime() + 45 * 60 * 1000),
      createdAt: now,
      updatedAt: now,
    };

    this.orders.set(orderId, order);
    this.orderItems.set(orderId, items);

    this.logger.log(`Order ${orderId} created with total R${total}`);
    return order;
  }

  /**
   * Update order status with validation
   */
  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    metadata?: { driverId?: string; reason?: string }
  ): Promise<{ success: boolean; previousStatus: OrderStatus; newStatus: OrderStatus; timestamp: Date }> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // Validate status transition
    if (!this.isValidStatusTransition(order.status, newStatus)) {
      throw new Error(`Invalid status transition from ${order.status} to ${newStatus}`);
    }

    const previousStatus = order.status;
    const timestamp = new Date();

    // Update status and timestamps
    order.status = newStatus;
    order.updatedAt = timestamp;

    switch (newStatus) {
      case 'confirmed':
        order.confirmedAt = timestamp;
        break;
      case 'preparing':
        order.preparingAt = timestamp;
        break;
      case 'ready':
        order.readyAt = timestamp;
        break;
      case 'picked_up':
        order.pickedUpAt = timestamp;
        if (metadata?.driverId) {
          order.assignedDriverId = metadata.driverId;
        }
        break;
      case 'delivered':
        order.deliveredAt = timestamp;
        order.actualDeliveryTime = timestamp;
        break;
      case 'cancelled':
        order.cancelledAt = timestamp;
        order.cancellationReason = metadata?.reason || 'Cancelled';
        break;
    }

    this.orders.set(orderId, order);
    this.logger.log(`Order ${orderId} status updated: ${previousStatus} -> ${newStatus}`);

    return { success: true, previousStatus, newStatus, timestamp };
  }

  /**
   * Validate status transition
   */
  private isValidStatusTransition(from: OrderStatus, to: OrderStatus): boolean {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['picked_up', 'cancelled'],
      picked_up: ['en_route', 'delivered'],
      en_route: ['delivered'],
      delivered: [],
      cancelled: [],
    };

    return validTransitions[from].includes(to);
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<Order | null> {
    return this.orders.get(orderId) || null;
  }

  /**
   * Get orders with filters
   */
  async getOrders(filter: OrderFilter, pagination?: { page: number; limit: number }): Promise<{ orders: Order[]; total: number; page: number; totalPages: number }> {
    let results = Array.from(this.orders.values());

    // Apply filters
    if (filter.status?.length) {
      results = results.filter(o => filter.status!.includes(o.status));
    }
    if (filter.restaurantId) {
      results = results.filter(o => o.restaurantId === filter.restaurantId);
    }
    if (filter.userId) {
      results = results.filter(o => o.userId === filter.userId);
    }
    if (filter.driverId) {
      results = results.filter(o => o.assignedDriverId === filter.driverId);
    }
    if (filter.startDate) {
      results = results.filter(o => o.createdAt >= filter.startDate!);
    }
    if (filter.endDate) {
      results = results.filter(o => o.createdAt <= filter.endDate!);
    }
    if (filter.minTotal !== undefined) {
      results = results.filter(o => o.total >= filter.minTotal!);
    }
    if (filter.maxTotal !== undefined) {
      results = results.filter(o => o.total <= filter.maxTotal!);
    }

    // Sort by creation date
    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = results.length;
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const totalPages = Math.ceil(total / limit);

    // Apply pagination
    const paginatedResults = results.slice((page - 1) * limit, page * limit);

    return { orders: paginatedResults, total, page, totalPages };
  }

  /**
   * Assign driver to order
   */
  async assignDriver(orderId: string, driverId: string): Promise<boolean> {
    const order = this.orders.get(orderId);
    if (!order) {
      return false;
    }

    if (!['confirmed', 'preparing', 'ready'].includes(order.status)) {
      return false;
    }

    order.assignedDriverId = driverId;
    order.updatedAt = new Date();
    this.orders.set(orderId, order);

    this.logger.log(`Driver ${driverId} assigned to order ${orderId}`);
    return true;
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, reason: string): Promise<{ success: boolean; refundAmount: number }> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      throw new Error(`Cannot cancel order in ${order.status} status`);
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = reason;
    order.updatedAt = new Date();

    this.orders.set(orderId, order);

    // Calculate refund
    const refundAmount = order.paymentStatus === 'captured' ? order.total : 0;

    this.logger.log(`Order ${orderId} cancelled, refund: R${refundAmount}`);
    return { success: true, refundAmount };
  }

  /**
   * Bulk update orders
   */
  async bulkUpdateOrders(request: BulkUpdateRequest): Promise<{ success: number; failed: number; errors: string[] }> {
    let success = 0;
    const failed = 0;
    const errors: string[] = [];

    for (const orderId of request.orderIds) {
      try {
        if (request.status) {
          await this.updateOrderStatus(orderId, request.status);
        }
        if (request.driverId) {
          await this.assignDriver(orderId, request.driverId);
        }
        success++;
      } catch (error) {
        failed++;
        errors.push(`${orderId}: ${error.message}`);
      }
    }

    this.logger.log(`Bulk update complete: ${success} succeeded, ${failed} failed`);
    return { success, failed, errors };
  }

  /**
   * Get order statistics
   */
  async getOrderStatistics(restaurantId?: string, startDate?: Date, endDate?: Date): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    completedOrders: number;
    cancelledOrders: number;
    cancellationRate: number;
    averageDeliveryTime: number;
    ordersByStatus: Record<OrderStatus, number>;
    ordersByHour: Record<string, number>;
  }> {
    let orders = Array.from(this.orders.values());

    if (restaurantId) {
      orders = orders.filter(o => o.restaurantId === restaurantId);
    }
    if (startDate) {
      orders = orders.filter(o => o.createdAt >= startDate);
    }
    if (endDate) {
      orders = orders.filter(o => o.createdAt <= endDate);
    }

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
    const cancellationRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;

    // Calculate average delivery time for completed orders
    const deliveredOrders = orders.filter(o => o.deliveredAt && o.createdAt);
    const averageDeliveryTime = deliveredOrders.length > 0
      ? deliveredOrders.reduce((sum, o) => sum + (o.actualDeliveryTime!.getTime() - o.createdAt.getTime()), 0) / deliveredOrders.length / 60000
      : 0;

    // Orders by status
    const ordersByStatus: Record<OrderStatus, number> = {
      pending: 0, confirmed: 0, preparing: 0, ready: 0,
      picked_up: 0, en_route: 0, delivered: 0, cancelled: 0,
    };
    for (const order of orders) {
      ordersByStatus[order.status]++;
    }

    // Orders by hour
    const ordersByHour: Record<string, number> = {};
    for (const order of orders) {
      const hour = order.createdAt.getHours().toString();
      ordersByHour[hour] = (ordersByHour[hour] || 0) + 1;
    }

    return {
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      completedOrders,
      cancelledOrders,
      cancellationRate: Math.round(cancellationRate * 100) / 100,
      averageDeliveryTime: Math.round(averageDeliveryTime),
      ordersByStatus,
      ordersByHour,
    };
  }

  /**
   * Apply discount to order
   */
  async applyDiscount(orderId: string, discountAmount: number): Promise<boolean> {
    const order = this.orders.get(orderId);
    if (!order) {
      return false;
    }

    order.discount = discountAmount;
    order.total = order.subtotal + order.deliveryFee + order.serviceFee - discountAmount + order.tip;
    order.updatedAt = new Date();

    this.orders.set(orderId, order);
    return true;
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(orderId: string, status: PaymentStatus): Promise<boolean> {
    const order = this.orders.get(orderId);
    if (!order) {
      return false;
    }

    order.paymentStatus = status;
    order.updatedAt = new Date();

    this.orders.set(orderId, order);
    return true;
  }

  /**
   * Get active orders count
   */
  async getActiveOrdersCount(restaurantId?: string): Promise<number> {
    let orders = Array.from(this.orders.values());
    
    if (restaurantId) {
      orders = orders.filter(o => o.restaurantId === restaurantId);
    }

    return orders.filter(o => 
      ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'en_route'].includes(o.status)
    ).length;
  }

  /**
   * Get customer order history
   */
  async getCustomerOrders(userId: string, limit?: number): Promise<Order[]> {
    const orders = Array.from(this.orders.values())
      .filter(o => o.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return limit ? orders.slice(0, limit) : orders;
  }

  /**
   * Reorder from previous order
   */
  async reorder(orderId: string): Promise<Order> {
    const originalOrder = this.orders.get(orderId);
    if (!originalOrder) {
      throw new Error(`Order ${orderId} not found`);
    }

    // Create new order with same items
    return this.createOrder({
      userId: originalOrder.userId,
      restaurantId: originalOrder.restaurantId,
      items: originalOrder.items.map(item => ({
        menuItemId: item.menuItemId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        modifiers: item.modifiers.map(m => ({ id: m.id, name: m.name, price: m.price })),
      })),
      deliveryAddress: originalOrder.deliveryAddress,
      paymentMethod: originalOrder.paymentMethod,
    });
  }
}