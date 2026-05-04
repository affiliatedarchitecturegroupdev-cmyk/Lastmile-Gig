import { Injectable } from '@nestjs/common';

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'order' | 'driver' | 'promo' | 'system' | 'loyalty';
  title: string;
  body: string;
  variables: string[];
  channel: 'push' | 'sms' | 'email' | 'all';
}

@Injectable()
export class NotificationTemplatesService {
  private templates: Map<string, NotificationTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    const templates: NotificationTemplate[] = [
      // Order Templates
      { id: 'order_confirmed', name: 'Order Confirmed', type: 'order', title: 'Order Confirmed! 🎉', body: 'Your order #{{orderId}} has been confirmed by {{partnerName}}', variables: ['orderId', 'partnerName'], channel: 'push' },
      { id: 'order_preparing', name: 'Order Preparing', type: 'order', title: 'Preparing Your Order 🍔', body: '{{partnerName}} is preparing your delicious order', variables: ['partnerName'], channel: 'push' },
      { id: 'order_ready', name: 'Order Ready', type: 'order', title: 'Ready for Pickup! 📦', body: 'Your order is ready and will be dispatched soon', variables: [], channel: 'push' },
      { id: 'order_dispatched', name: 'Order Dispatched', type: 'order', title: 'On the Way! 🚗', body: 'Driver {{driverName}} is on the way to you', variables: ['driverName'], channel: 'push' },
      { id: 'order_delivered', name: 'Order Delivered', type: 'order', title: 'Delivered! ⭐', body: 'Your order has been delivered. Enjoy your meal!', variables: [], channel: 'push' },
      { id: 'order_reminder', name: 'Order Reminder', type: 'order', title: 'Rate Your Order', body: 'How was your order from {{partnerName}}?', variables: ['partnerName'], channel: 'push' },

      // Driver Templates
      { id: 'new_order', name: 'New Order Available', type: 'driver', title: 'New Order! 💰', body: 'New order from {{partnerName}} - R{{orderValue}}', variables: ['partnerName', 'orderValue'], channel: 'push' },
      { id: 'order_assigned', name: 'Order Assigned', type: 'driver', title: 'Order Assigned', body: 'Pick up from {{partnerName}}, deliver to {{address}}', variables: ['partnerName', 'address'], channel: 'push' },
      { id: 'payout_complete', name: 'Payout Complete', type: 'driver', title: 'Payout Complete! 💵', body: 'R{{amount}} has been added to your wallet', variables: ['amount'], channel: 'push' },

      // Promotional Templates
      { id: 'promo_deal', name: 'Special Deal', type: 'promo', title: 'Limited Deal! 🔥', body: '{{partnerName}} - {{discount}}% off your order', variables: ['partnerName', 'discount'], channel: 'all' },
      { id: 'promo_free_delivery', name: 'Free Delivery', type: 'promo', title: 'Free Delivery! 🚚', body: 'Free delivery on all orders today', variables: [], channel: 'all' },
      { id: 'promo_double_points', name: 'Double Points', type: 'loyalty', title: 'Double Points! ⭐', body: 'Earn 2x points on your next order', variables: [], channel: 'push' },

      // System Templates
      { id: 'welcome', name: 'Welcome', type: 'system', title: 'Welcome to Lastmile! 🎉', body: 'Start ordering from your favorite restaurants', variables: [], channel: 'push' },
      { id: 'account_verified', name: 'Account Verified', type: 'system', title: 'Account Verified ✅', body: 'Your account has been verified', variables: [], channel: 'push' },
    ];

    for (const template of templates) {
      this.templates.set(template.id, template);
    }
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): NotificationTemplate | null {
    return this.templates.get(templateId) || null;
  }

  /**
   * Get templates by type
   */
  getTemplatesByType(type: string): NotificationTemplate[] {
    return Array.from(this.templates.values())
      .filter(t => t.type === type);
  }

  /**
   * Render template with variables
   */
  render(templateId: string, variables: Record<string, string>): {
    title: string;
    body: string;
  } | null {
    const template = this.templates.get(templateId);
    if (!template) return null;

    let title = template.title;
    let body = template.body;

    for (const [key, value] of Object.entries(variables)) {
      title = title.replace(new RegExp(`{{${key}}}`, 'g'), value);
      body = body.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    return { title, body };
  }

  /**
   * Get all templates
   */
  getAllTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Create custom template
   */
  createTemplate(template: NotificationTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Update template
   */
  updateTemplate(templateId: string, updates: Partial<NotificationTemplate>): void {
    const template = this.templates.get(templateId);
    if (template) {
      Object.assign(template, updates);
    }
  }

  /**
   * Delete template
   */
  deleteTemplate(templateId: string): void {
    this.templates.delete(templateId);
  }
}