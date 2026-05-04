import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export type NotificationType = 'order' | 'driver' | 'promo' | 'system' | 'loyalty';
export type NotificationChannel = 'push' | 'sms' | 'email';
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed';

export interface PushNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  channels: NotificationChannel[];
  status: NotificationStatus;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
}

export interface PushToken {
  userId: string;
  token: string;
  deviceType: 'ios' | 'android' | 'web';
  lastUpdated: Date;
}

@Injectable()
export class PushNotificationService {
  private tokens: Map<string, PushToken[]> = new Map();
  private notifications: Map<string, PushNotification[]> = new Map();

  /**
   * Register device token
   */
  async registerToken(data: {
    userId: string;
    token: string;
    deviceType: 'ios' | 'android' | 'web';
  }): Promise<PushToken> {
    const pushToken: PushToken = {
      ...data,
      lastUpdated: new Date(),
    };

    const userTokens = this.tokens.get(data.userId) || [];
    // Remove old token if exists
    const existingIndex = userTokens.findIndex(t => t.deviceType === data.deviceType);
    if (existingIndex >= 0) {
      userTokens[existingIndex] = pushToken;
    } else {
      userTokens.push(pushToken);
    }
    this.tokens.set(data.userId, userTokens);

    return pushToken;
  }

  /**
   * Send push notification
   */
  async send(data: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, any>;
    channels?: NotificationChannel[];
  }): Promise<PushNotification> {
    const channels = data.channels || ['push'];
    
    const notification: PushNotification = {
      id: uuidv4(),
      userId: data.userId,
      type: data.type,
      title: data.title,
      body: data.body,
      data: data.data,
      channels,
      status: 'pending',
    };

    // Get user tokens
    const tokens = this.tokens.get(data.userId) || [];
    
    if (tokens.length > 0) {
      // Would send to FCM/APNS
      notification.status = 'sent';
      notification.sentAt = new Date();
    }

    // Store notification
    const userNotifications = this.notifications.get(data.userId) || [];
    userNotifications.push(notification);
    this.notifications.set(data.userId, userNotifications);

    return notification;
  }

  /**
   * Send to multiple users
   */
  async sendBulk(userIds: string[], notification: {
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, any>;
  }): Promise<number> {
    let sent = 0;
    
    for (const userId of userIds) {
      await this.send({ userId, ...notification });
      sent++;
    }

    return sent;
  }

  /**
   * Mark as delivered
   */
  async markDelivered(notificationId: string, userId: string): Promise<void> {
    const userNotifications = this.notifications.get(userId) || [];
    const notification = userNotifications.find(n => n.id === notificationId);
    
    if (notification) {
      notification.status = 'delivered';
      notification.deliveredAt = new Date();
    }
  }

  /**
   * Mark as read
   */
  async markRead(notificationId: string, userId: string): Promise<void> {
    const userNotifications = this.notifications.get(userId) || [];
    const notification = userNotifications.find(n => n.id === notificationId);
    
    if (notification) {
      notification.readAt = new Date();
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(
    userId: string,
    limit: number = 50,
    unreadOnly: boolean = false
  ): Promise<PushNotification[]> {
    const userNotifications = this.notifications.get(userId) || [];
    let filtered = userNotifications;

    if (unreadOnly) {
      filtered = userNotifications.filter(n => !n.readAt);
    }

    return filtered.slice(-limit).reverse();
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string): Promise<number> {
    const userNotifications = this.notifications.get(userId) || [];
    return userNotifications.filter(n => !n.readAt).length;
  }

  /**
   * Delete token (logout)
   */
  async removeToken(userId: string, deviceType: string): Promise<void> {
    const userTokens = this.tokens.get(userId) || [];
    const filtered = userTokens.filter(t => t.deviceType !== deviceType);
    this.tokens.set(userId, filtered);
  }

  /**
   * Send order update notification
   */
  async sendOrderUpdate(userId: string, orderId: string, status: string): Promise<PushNotification> {
    const messages: Record<string, { title: string; body: string }> = {
      confirmed: { title: 'Order Confirmed', body: `Your order #${orderId} has been confirmed` },
      preparing: { title: 'Preparing', body: `Your order #${orderId} is being prepared` },
      ready: { title: 'Ready for Pickup', body: `Your order #${orderId} is ready` },
      dispatched: { title: 'On the Way', body: `Driver is on the way with your order` },
      delivered: { title: 'Delivered', body: `Your order #${orderId} has been delivered` },
    };

    const msg = messages[status] || { title: 'Update', body: `Order #${orderId} updated` };
    
    return this.send({
      userId,
      type: 'order',
      title: msg.title,
      body: msg.body,
      data: { orderId, status },
    });
  }

  /**
   * Send driver notification
   */
  async sendDriverNotification(
    driverId: string,
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<PushNotification> {
    return this.send({
      userId: driverId,
      type: 'driver',
      title,
      body,
      data,
    });
  }

  /**
   * Send promotional notification
   */
  async sendPromotional(userId: string, title: string, body: string): Promise<PushNotification> {
    return this.send({
      userId,
      type: 'promo',
      title,
      body,
    });
  }
}