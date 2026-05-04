import { Injectable } from '@nestjs/common';

export interface NotificationPreferences {
  userId: string;
  orderUpdates: boolean;
  driverAlerts: boolean;
  promotions: boolean;
  loyaltyRewards: boolean;
  systemMessages: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: string; // HH:mm
  quietHoursEnd?: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

@Injectable()
export class NotificationPreferencesService {
  private preferences: Map<string, NotificationPreferences> = new Map();

  /**
   * Get user preferences
   */
  async getPreferences(userId: string): Promise<NotificationPreferences> {
    let prefs = this.preferences.get(userId);
    
    if (!prefs) {
      prefs = this.getDefaultPreferences(userId);
      this.preferences.set(userId, prefs);
    }

    return prefs;
  }

  /**
   * Get default preferences
   */
  private getDefaultPreferences(userId: string): NotificationPreferences {
    return {
      userId,
      orderUpdates: true,
      driverAlerts: true,
      promotions: true,
      loyaltyRewards: true,
      systemMessages: true,
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
      emailNotifications: true,
      smsNotifications: false,
    };
  }

  /**
   * Update preferences
   */
  async updatePreferences(
    userId: string,
    updates: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const prefs = await this.getPreferences(userId);
    Object.assign(prefs, updates);
    this.preferences.set(userId, prefs);
    return prefs;
  }

  /**
   * Toggle notification type
   */
  async toggleNotificationType(
    userId: string,
    type: keyof Omit<NotificationPreferences, 'userId'>
  ): Promise<NotificationPreferences> {
    const prefs = await this.getPreferences(userId);
    prefs[type] = !prefs[type];
    this.preferences.set(userId, prefs);
    return prefs;
  }

  /**
   * Set quiet hours
   */
  async setQuietHours(
    userId: string,
    enabled: boolean,
    start?: string,
    end?: string
  ): Promise<NotificationPreferences> {
    const prefs = await this.getPreferences(userId);
    prefs.quietHoursEnabled = enabled;
    if (start) prefs.quietHoursStart = start;
    if (end) prefs.quietHoursEnd = end;
    this.preferences.set(userId, prefs);
    return prefs;
  }

  /**
   * Check if notification should be sent
   */
  async shouldSendNotification(
    userId: string,
    type: 'orderUpdates' | 'driverAlerts' | 'promotions' | 'loyaltyRewards' | 'systemMessages'
  ): Promise<boolean> {
    const prefs = await this.getPreferences(userId);

    // Check if type is enabled
    if (!prefs[type]) return false;

    // Check quiet hours
    if (prefs.quietHoursEnabled && prefs.quietHoursStart && prefs.quietHoursEnd) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [startHour, startMin] = prefs.quietHoursStart.split(':').map(Number);
      const [endHour, endMin] = prefs.quietHoursEnd.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (startMinutes < endMinutes) {
        if (currentTime >= startMinutes && currentTime < endMinutes) return false;
      } else {
        if (currentTime >= startMinutes || currentTime < endMinutes) return false;
      }
    }

    return true;
  }

  /**
   * Bulk update preference for admin
   */
  async bulkUpdatePreferences(
    userIds: string[],
    updates: Partial<NotificationPreferences>
  ): Promise<number> {
    let updated = 0;
    for (const userId of userIds) {
      await this.updatePreferences(userId, updates);
      updated++;
    }
    return updated;
  }

  /**
   * Get preferences summary
   */
  async getPreferencesSummary(): Promise<{
    totalUsers: number;
    promotionsEnabled: number;
    quietHoursEnabled: number;
  }> {
    let promotionsEnabled = 0;
    let quietHoursEnabled = 0;

    for (const prefs of this.preferences.values()) {
      if (prefs.promotions) promotionsEnabled++;
      if (prefs.quietHoursEnabled) quietHoursEnabled++;
    }

    return {
      totalUsers: this.preferences.size,
      promotionsEnabled,
      quietHoursEnabled,
    };
  }
}