import { Server } from 'socket.io';
import { Order, OrderStatus } from '../apps/svc-orders/src/orders/entities/order.entity';

export interface OrderTrackingEvent {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  previousStatus?: OrderStatus;
  timestamp: Date;
}

export interface ETAUpdate {
  orderId: string;
  estimatedDeliveryTime: Date;
  distanceKm: number;
  remainingMinutes: number;
}

export class OrderTrackingService {
  private io: Server;
  private orderETAs: Map<string, ETAUpdate> = new Map();
  private updateIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(io: Server) {
    this.io = io;
  }

  // Initialize tracking for a new order
  async trackOrder(order: Order) {
    const event: OrderTrackingEvent = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status as OrderStatus,
      timestamp: new Date(),
    };

    // Notify customer
    this.io.to(`user:${order.customerId}`).emit('order:tracking', event);
    this.io.to(`order:${order.id}`).emit('order:tracking', event);

    // Start ETA updates if order is dispatched
    if (order.status === OrderStatus.DISPATCHED) {
      this.startETAUpdates(order.id);
    }
  }

  // Handle status change
  async onStatusChange(
    order: Order,
    previousStatus: OrderStatus,
    newStatus: OrderStatus,
  ) {
    const event: OrderTrackingEvent = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: newStatus,
      previousStatus,
      timestamp: new Date(),
    };

    // Broadcast to relevant rooms
    this.io.to(`user:${order.customerId}`).emit('order:tracking', event);
    this.io.to(`order:${order.id}`).emit('order:tracking', event);
    this.io.to('orders').emit('order:statuschange', event);

    // Handle specific status transitions
    if (newStatus === OrderStatus.DISPATCHED) {
      this.startETAUpdates(order.id);
    } else if (newStatus === OrderStatus.DELIVERED) {
      this.stopETAUpdates(order.id);
      this.io.to(`user:${order.customerId}`).emit('order:delivered', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: OrderStatus.DELIVERED,
        timestamp: new Date(),
      });
    } else if (newStatus === OrderStatus.CANCELLED) {
      this.stopETAUpdates(order.id);
    }
  }

  // Handle driver assignment
  async onDriverAssigned(order: Order, driver: any) {
    this.io.to(`user:${order.customerId}`).emit('order:driverassigned', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      driverId: driver.id,
      driverName: `${driver.firstName} ${driver.lastName}`,
      driverPhone: driver.phone,
      vehicleInfo: `${driver.vehicleType} - ${driver.vehiclePlate}`,
      timestamp: new Date(),
    });

    // Join driver to order room for location tracking
    // Handled by driver connection logic
  }

  // ETA update handling
  private startETAUpdates(orderId: string) {
    // Calculate initial ETA
    this.updateETA(orderId);

    // Update every 30 seconds
    const interval = setInterval(() => {
      this.updateETA(orderId);
    }, 30000);

    this.updateIntervals.set(orderId, interval);
  }

  private stopETAUpdates(orderId: string) {
    const interval = this.updateIntervals.get(orderId);
    if (interval) {
      clearInterval(interval);
      this.updateIntervals.delete(orderId);
    }
    this.orderETAs.delete(orderId);
  }

  private updateETA(orderId: string) {
    const eta = this.orderETAs.get(orderId);
    if (eta) {
      const remainingMinutes = Math.max(0, 
        Math.ceil((eta.estimatedDeliveryTime.getTime() - Date.now()) / 60000)
      );

      this.io.to(`order:${orderId}`).emit('order:eta', {
        ...eta,
        remainingMinutes,
      });

      this.io.to(`user:${eta.userId}`).emit('order:eta', {
        ...eta,
        remainingMinutes,
      });
    }
  }

  // Calculate route ETA
  async calculateETA(orderId: string): Promise<ETAUpdate | null> {
    // Integrate with routing/dispatch service
    const order = null; // Fetch from order service
    
    if (!order) return null;

    const distanceKm = 5; // Calculate from routing service
    const estimatedMinutes = 20;

    const eta: ETAUpdate = {
      orderId,
      estimatedDeliveryTime: new Date(Date.now() + estimatedMinutes * 60000),
      distanceKm,
      remainingMinutes: estimatedMinutes,
    };

    this.orderETAs.set(orderId, eta);
    return eta;
  }

  // Get current tracking state for order
  getTrackingState(orderId: string) {
    return {
      eta: this.orderETAs.get(orderId),
      isTracking: this.updateIntervals.has(orderId),
    };
  }

  // Cleanup
  cleanup(orderId: string) {
    this.stopETAUpdates(orderId);
  }
}