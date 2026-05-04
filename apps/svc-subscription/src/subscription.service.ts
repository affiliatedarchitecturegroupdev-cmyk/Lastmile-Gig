import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export type SubscriptionTier = 'none' | 'gigapass_basic' | 'gigapass_premium';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due';

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  startedAt: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelledAt?: Date;
  autoRenew: boolean;
}

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  priceZAR: number;
  interval: 'month' | 'year';
  features: string[];
  perks: SubscriptionPerk[];
}

export interface SubscriptionPerk {
  id: string;
  type: 'discount' | 'free_delivery' | 'priority_support' | 'exclusive_deal';
  value: number; // percentage or fixed amount
  description: string;
  minOrderValue?: number;
}

export interface SubscriptionBenefit {
  type: 'discount' | 'free_delivery';
  value: number;
  appliedTo: 'subtotal' | 'delivery_fee' | 'total';
  description: string;
}

@Injectable()
export class SubscriptionService {
  private subscriptions: Map<string, Subscription> = new Map();
  private plans: SubscriptionPlan[] = this.initializePlans();

  private initializePlans(): SubscriptionPlan[] {
    return [
      {
        tier: 'gigapass_basic',
        name: 'GigaPass Basic',
        priceZAR: 99,
        interval: 'month',
        features: [
          'Free delivery on orders over R150',
          '5% off every order',
          'Exclusive deals',
        ],
        perks: [
          { id: 'free_delivery_basic', type: 'free_delivery', value: 1, description: 'Free delivery on orders over R150', minOrderValue: 150 },
          { id: 'discount_basic', type: 'discount', value: 5, description: '5% off every order' },
          { id: 'exclusive_deals_basic', type: 'exclusive_deal', value: 0, description: 'Access to exclusive deals' },
        ],
      },
      {
        tier: 'gigapass_premium',
        name: 'GigaPass Premium',
        priceZAR: 199,
        interval: 'month',
        features: [
          'Free delivery on ALL orders',
          '10% off every order',
          'Priority support',
          'Exclusive deals',
          'Free items monthly',
        ],
        perks: [
          { id: 'free_delivery_premium', type: 'free_delivery', value: 9999, description: 'Free delivery on all orders', minOrderValue: 0 },
          { id: 'discount_premium', type: 'discount', value: 10, description: '10% off every order' },
          { id: 'priority_support_premium', type: 'priority_support', value: 1, description: 'Priority customer support' },
          { id: 'exclusive_deals_premium', type: 'exclusive_deal', value: 0, description: 'Premium exclusive deals' },
        ],
      },
    ];
  }

  getPlans(): SubscriptionPlan[] {
    return this.plans;
  }

  getPlanByTier(tier: SubscriptionTier): SubscriptionPlan | undefined {
    return this.plans.find(p => p.tier === tier);
  }

  async subscribe(userId: string, tier: SubscriptionTier): Promise<Subscription> {
    const existing = await this.getUserSubscription(userId);
    
    if (existing && existing.tier !== 'none') {
      // Upgrade/downgrade
      existing.tier = tier;
      existing.status = 'active';
      existing.currentPeriodStart = new Date();
      existing.currentPeriodEnd = this.calculatePeriodEnd();
      existing.autoRenew = true;
      this.subscriptions.set(existing.id, existing);
      return existing;
    }

    const subscription: Subscription = {
      id: uuidv4(),
      userId,
      tier,
      status: 'active',
      startedAt: new Date(),
      currentPeriodStart: new Date(),
      currentPeriodEnd: this.calculatePeriodEnd(),
      autoRenew: true,
    };

    this.subscriptions.set(subscription.id, subscription);
    return subscription;
  }

  private calculatePeriodEnd(): Date {
    const now = new Date();
    now.setMonth(now.getMonth() + 1);
    return now;
  }

  async getUserSubscription(userId: string): Promise<Subscription | null> {
    for (const sub of this.subscriptions.values()) {
      if (sub.userId === userId && sub.status === 'active') {
        return sub;
      }
    }
    return null;
  }

  async cancelSubscription(userId: string): Promise<Subscription | null> {
    const sub = await this.getUserSubscription(userId);
    
    if (sub) {
      sub.status = 'cancelled';
      sub.cancelledAt = new Date();
      sub.autoRenew = false;
      this.subscriptions.set(sub.id, sub);
    }
    
    return sub;
  }

  async reactivateSubscription(userId: string): Promise<Subscription | null> {
    const sub = await this.getUserSubscription(userId);
    
    if (sub && sub.status === 'cancelled') {
      sub.status = 'active';
      sub.currentPeriodStart = new Date();
      sub.currentPeriodEnd = this.calculatePeriodEnd();
      sub.autoRenew = true;
      this.subscriptions.set(sub.id, sub);
    }
    
    return sub;
  }

  calculateBenefits(tier: SubscriptionTier, orderValue: number): SubscriptionBenefit[] {
    const plan = this.getPlanByTier(tier);
    if (!plan) return [];

    const benefits: SubscriptionBenefit[] = [];

    for (const perk of plan.perks) {
      if (perk.type === 'free_delivery') {
        const minValue = perk.minOrderValue || 0;
        if (orderValue >= minValue) {
          benefits.push({
            type: 'free_delivery',
            value: 35,
            appliedTo: 'delivery_fee',
            description: perk.description,
          });
        }
      } else if (perk.type === 'discount') {
        const discountValue = (orderValue * perk.value) / 100;
        benefits.push({
          type: 'discount',
          value: discountValue,
          appliedTo: 'subtotal',
          description: `R${discountValue.toFixed(2)} off (${perk.value}% discount)`,
        });
      }
    }

    return benefits;
  }

  async getSubscriptionBenefits(userId: string, orderValue: number): Promise<SubscriptionBenefit[]> {
    const sub = await this.getUserSubscription(userId);
    
    if (!sub || sub.status !== 'active') {
      return [];
    }

    return this.calculateBenefits(sub.tier, orderValue);
  }

  applyBenefits(orderTotal: number, benefits: SubscriptionBenefit[]): {
    discount: number;
    deliveryFee: number;
    finalTotal: number;
  } {
    let discount = 0;
    let deliveryFee = 35;

    for (const benefit of benefits) {
      if (benefit.type === 'discount' && benefit.appliedTo === 'subtotal') {
        discount += benefit.value;
      } else if (benefit.type === 'free_delivery' && benefit.appliedTo === 'delivery_fee') {
        deliveryFee = 0;
      }
    }

    const finalTotal = Math.max(0, orderTotal - discount + deliveryFee);

    return {
      discount,
      deliveryFee,
      finalTotal,
    };
  }

  async checkExpiry(): Promise<string[]> {
    const expiringSoon: string[] = [];
    const now = new Date();
    const warningDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days

    for (const sub of this.subscriptions.values()) {
      if (sub.status === 'active' && sub.currentPeriodEnd <= warningDate) {
        expiringSoon.push(sub.userId);
      }
    }

    return expiringSoon;
  }

  getSubscriptionStatus(userId: string): { tier: SubscriptionTier; status: SubscriptionStatus } {
    const sub = this.subscriptions.get(userId);
    return {
      tier: sub?.tier || 'none',
      status: sub?.status || 'active',
    };
  }
}