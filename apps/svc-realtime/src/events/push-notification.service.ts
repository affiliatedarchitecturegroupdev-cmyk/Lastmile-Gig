import { Server } from 'socket.io';

export interface PushNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  priority?: 'high' | 'normal';
  timestamp: Date;
}

export interface DeviceToken {
  userId: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
}

export class PushNotificationService {
  private io: Server;
  private deviceTokens: Map<string, DeviceToken[]> = new Map();

  constructor(io: Server) {
    this.io = io;
  }

  // Register device token
  registerToken(deviceToken: DeviceToken) {
    const tokens = this.deviceTokens.get(deviceToken.userId) || [];
    
    // Remove existing token if present
    const existingIndex = tokens.findIndex(t => t.token === deviceToken.token);
    if (existingIndex >= 0) {
      tokens.splice(existingIndex, 1);
    }
    
    tokens.push(deviceToken);
    this.deviceTokens.set(deviceToken.userId, tokens);
  }

  // Unregister device token
  unregisterToken(userId: string, token?: string) {
    if (!token) {
      this.deviceTokens.delete(userId);
      return;
    }

    const tokens = this.deviceTokens.get(userId) || [];
    const filtered = tokens.filter(t => t.token !== token);
    this.deviceTokens.set(userId, filtered);
  }

  // Send push notification to user
  async send(userId: string, notification: PushNotification) {
    // Send via WebSocket first (if connected)
    this.io.to(`user:${userId}`).emit('push:notification', notification);

    // Send via FCM/APNS for offline users
    const tokens = this.deviceTokens.get(userId) || [];
    
    for (const token of tokens) {
      try {
        if (token.platform === 'android') {
          await this.sendFCM(token.token, notification);
        } else if (token.platform === 'ios') {
          await this.sendAPNS(token.token, notification);
        }
      } catch (error) {
        console.error(`Push notification failed for ${token.platform}:`, error);
      }
    }
  }

  // Order-specific notifications
  async notifyOrderCreated(userId: string, order: any) {
    await this.send(userId, {
      id: `order:${order.id}:created`,
      userId,
      title: 'Order Confirmed 🔔',
      body: `Your order ${order.orderNumber} has been confirmed!`,
      data: { orderId: order.id, type: 'order_created' },
      priority: 'high',
      timestamp: new Date(),
    });
  }

  async notifyDriverAssigned(userId: string, order: any, driver: any) {
    await this.send(userId, {
      id: `order:${order.id}:driver`,
      userId,
      title: 'Driver Assigned 🚗',
      body: `${driver.name} is on the way to pick up your order!`,
      data: { orderId: order.id, driverId: driver.id, type: 'driver_assigned' },
      priority: 'high',
      timestamp: new Date(),
    });
  }

  async notifyDeliveryArriving(userId: string, order: any, minutes: number) {
    await this.send(userId, {
      id: `order:${order.id}:arriving`,
      userId,
      title: 'Almost There! 📦',
      body: `Your order arrives in ${minutes} minutes`,
      data: { orderId: order.id, type: 'delivery_arriving' },
      priority: 'high',
      timestamp: new Date(),
    });
  }

  async notifyOrderDelivered(userId: string, order: any) {
    await this.send(userId, {
      id: `order:${order.id}:delivered`,
      userId,
      title: 'Order Delivered ✅',
      body: `Your order ${order.orderNumber} has been delivered. Enjoy!`,
      data: { orderId: order.id, type: 'order_delivered' },
      priority: 'normal',
      timestamp: new Date(),
    });
  }

  async notifyOrderStatusChange(userId: string, order: any, status: string) {
    const titles: Record<string, string> = {
      confirmed: 'Order Confirmed',
      preparing: 'Preparing Your Order',
      ready: 'Ready for Pickup',
      dispatched: 'Out for Delivery',
    };

    await this.send(userId, {
      id: `order:${order.id}:status`,
      userId,
      title: titles[status] || 'Order Update',
      body: `Your order ${order.orderNumber} is now ${status}`,
      data: { orderId: order.id, status, type: 'order_status' },
      priority: 'high',
      timestamp: new Date(),
    });
  }

  // Firebase Cloud Messaging (FCM)
  private async sendFCM(token: string, notification: PushNotification) {
    // Integrate with Firebase Admin SDK
    console.log(`Sending FCM to ${token}:`, notification.title);
  }

  // Apple Push Notification Service (APNS)
  private async sendAPNS(token: string, notification: PushNotification) {
    // Integrate with apns library
    console.log(`Sending APNS to ${token}:`, notification.title);
  }

  // Get user devices
  getDevices(userId: string): DeviceToken[] {
    return this.deviceTokens.get(userId) || [];
  }

  // Broadcast to all users
  async broadcast(notification: Omit<PushNotification, 'id' | 'userId' | 'timestamp'>) {
    for (const [userId] of this.deviceTokens) {
      await this.send(userId, {
        ...notification,
        id: `broadcast:${Date.now()}`,
        userId,
        timestamp: new Date(),
      });
    }
  }
}