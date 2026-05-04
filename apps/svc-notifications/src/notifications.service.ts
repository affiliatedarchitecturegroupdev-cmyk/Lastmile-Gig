import { Injectable } from '@nestjs/common';

export interface Notification {
  id: string;
  userId: string;
  channel: 'push' | 'sms' | 'email';
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
  createdAt: Date;
}

@Injectable()
export class NotificationsService {
  private notifications: Map<string, Notification[]> = new Map();

  async send(userId: string, type: string, title: string, body: string, data?: Record<string, any>, channel: 'push' | 'sms' | 'email' = 'push'): Promise<Notification> {
    const notification: Notification = {
      id: crypto.randomUUID(),
      userId,
      channel,
      type,
      title,
      body,
      data,
      status: 'pending',
      createdAt: new Date(),
    };

    // Send via channel
    try {
      await this.sendChannel(notification);
      notification.status = 'sent';
      notification.sentAt = new Date();
    } catch (error) {
      notification.status = 'failed';
    }

    const userNotifications = this.notifications.get(userId) || [];
    userNotifications.push(notification);
    this.notifications.set(userId, userNotifications);

    return notification;
  }

  async sendChannel(notification: Notification): Promise<void> {
    // In production: integrate with Firebase/APNS/Twilio/SendGrid
    console.log(`[${notification.channel.toUpperCase()}] to ${notification.userId}: ${notification.title}`);
  }

  async getByUser(userId: string, limit = 50): Promise<Notification[]> {
    return (this.notifications.get(userId) || []).slice(-limit);
  }

  async sendBulk(userIds: string[], type: string, title: string, body: string): Promise<number> {
    let sent = 0;
    for (const userId of userIds) {
      try {
        await this.send(userId, type, title, body);
        sent++;
      } catch (e) {
        // Continue
      }
    }
    return sent;
  }

  async sendOrderPlaced(userId: string, orderId: string): Promise<Notification> {
    return this.send(userId, 'order.placed', 'Order Confirmed', `Your order #${orderId} has been confirmed`);
  }

  async sendOrderDelivered(userId: string, orderId: string): Promise<Notification> {
    return this.send(userId, 'order.delivered', 'Order Delivered', `Your order #${orderId} has arrived!`);
  }

  async sendDriverAssigned(userId: string, orderId: string, driverName: string): Promise<Notification> {
    return this.send(userId, 'driver.assigned', 'Driver Assigned', `${driverName} is picking up your order`);
  }
}