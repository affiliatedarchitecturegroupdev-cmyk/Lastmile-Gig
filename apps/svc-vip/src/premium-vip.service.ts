import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export type VIPTier = 'platinum' | 'gold' | 'diamond';
export type VIPStatus = 'active' | 'expired' | 'suspended';

export interface VIPSubscription {
  id: string;
  userId: string;
  tier: VIPTier;
  status: VIPStatus;
  startedAt: Date;
  expiresAt: Date;
  autoRenew: boolean;
  benefits: string[];
}

export interface ExclusivePartner {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  exclusivity: 'platinum' | 'gold' | 'diamond' | 'all';
  prioritySlots: number;
}

@Injectable()
export class PremiumVIPService {
  private subscriptions: Map<string, VIPSubscription> = new Map();
  private partners: Map<string, ExclusivePartner> = new Map();
  private slots: Map<string, { time: string; available: number }[]> = new Map();

  constructor() {
    this.loadPartners();
    this.loadSlots();
  }

  private loadPartners(): void {
    const partners: ExclusivePartner[] = [
      { id: 'p1', name: 'The Fine Dining Co', cuisine: 'Fine Dining', rating: 4.9, exclusivity: 'diamond', prioritySlots: 20 },
      { id: 'p2', name: 'Bistro Elite', cuisine: 'French', rating: 4.8, exclusivity: 'platinum', prioritySlots: 15 },
      { id: 'p3', name: 'Gourmet Express', cuisine: 'International', rating: 4.7, exclusivity: 'gold', prioritySlots: 10 },
      { id: 'p4', name: 'Chef\'s Table', cuisine: 'Fusion', rating: 4.9, exclusivity: 'diamond', prioritySlots: 12 },
      { id: 'p5', name: 'Urban Eats', cuisine: 'Modern', rating: 4.6, exclusivity: 'all', prioritySlots: 25 },
    ];

    for (const p of partners) {
      this.partners.set(p.id, p);
    }
  }

  private loadSlots(): void {
    // VIP priority time slots
    const vipSlots = [
      { time: '12:00', available: 10 },
      { time: '12:30', available: 10 },
      { time: '13:00', available: 10 },
      { time: '18:00', available: 10 },
      { time: '18:30', available: 10 },
      { time: '19:00', available: 10 },
      { time: '19:30', available: 10 },
      { time: '20:00', available: 10 },
    ];

    this.slots.set('default', vipSlots);
  }

  /**
   * Subscribe to VIP
   */
  async subscribe(data: {
    userId: string;
    tier: VIPTier;
    autoRenew?: boolean;
  }): Promise<VIPSubscription> {
    const months = data.tier === 'diamond' ? 12 : data.tier === 'gold' ? 6 : 3;
    const startedAt = new Date();
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + months);

    const benefits = this.getTierBenefits(data.tier);

    const subscription: VIPSubscription = {
      id: uuidv4(),
      userId: data.userId,
      tier: data.tier,
      status: 'active',
      startedAt,
      expiresAt,
      autoRenew: data.autoRenew || false,
      benefits,
    };

    this.subscriptions.set(subscription.id, subscription);
    return subscription;
  }

  /**
   * Get tier benefits
   */
  private getTierBenefits(tier: VIPTier): string[] {
    const common = [
      'Priority support',
      'Order tracking',
    ];

    const tierBenefits = {
      platinum: ['Priority dispatch', 'Free delivery', '10% cashback', 'Exclusive partners', 'Dedicated windows'],
      gold: ['Priority dispatch', 'Free delivery', '5% cashback', 'Exclusive partners', 'Dedicated windows'],
      diamond: ['Priority dispatch', 'Free delivery', '15% cashback', 'Exclusive partners', 'Dedicated windows', 'Concierge support'],
    };

    return [...common, ...tierBenefits[tier]];
  }

  /**
   * Get user subscription
   */
  async getSubscription(userId: string): Promise<VIPSubscription | null> {
    for (const sub of this.subscriptions.values()) {
      if (sub.userId === userId && sub.status === 'active') {
        return sub;
      }
    }
    return null;
  }

  /**
   * Check priority dispatch eligibility
   */
  async checkPriorityDispatch(userId: string): Promise<{
    eligible: boolean;
    tier?: VIPTier;
    queueJump: number;
  }> {
    const sub = await this.getSubscription(userId);
    
    if (!sub) return { eligible: false, queueJump: 0 };

    const queueJump = {
      platinum: 5,
      gold: 3,
      diamond: 10,
    };

    return {
      eligible: true,
      tier: sub.tier,
      queueJump: queueJump[sub.tier],
    };
  }

  /**
   * Get exclusive partners
   */
  async getExclusivePartners(userId?: string): Promise<ExclusivePartner[]> {
    let sub: VIPSubscription | null = null;
    if (userId) {
      sub = await this.getSubscription(userId);
    }

    let partners = Array.from(this.partners.values());
    
    if (sub) {
      partners = partners.filter(p => 
        p.exclusivity === 'all' || 
        p.exclusivity === sub.tier
      );
    }

    return partners;
  }

  /**
   * Reserve priority slot
   */
  async reservePrioritySlot(userId: string, date: string, time: string): Promise<{
    reserved: boolean;
    slot: string;
  }> {
    const sub = await this.getSubscription(userId);
    if (!sub) return { reserved: false, slot: '' };

    const slots = this.slots.get('default') || [];
    const slotIndex = slots.findIndex(s => s.time === time);

    if (slotIndex >= 0 && slots[slotIndex].available > 0) {
      slots[slotIndex].available--;
      return { reserved: true, slot: `${date} ${time}` };
    }

    return { reserved: false, slot: '' };
  }

  /**
   * Get available VIP slots
   */
  async getAvailableSlots(date: string): Promise<{ time: string; available: number }[]> {
    return this.slots.get('default') || [];
  }

  /**
   * Get cashback earned
   */
  async getCashbackEarned(userId: string): Promise<{
    pending: number;
    available: number;
    total: number;
  }> {
    return {
      pending: Math.floor(Math.random() * 500),
      available: Math.floor(Math.random() * 1000),
      total: Math.floor(Math.random() * 1500),
    };
  }

  /**
   * Upgrade tier
   */
  async upgradeTier(userId: string, newTier: VIPTier): Promise<VIPSubscription | null> {
    const current = await this.getSubscription(userId);
    if (!current) return null;

    const months = newTier === 'diamond' ? 12 : newTier === 'gold' ? 6 : 3;
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + months);

    current.tier = newTier;
    current.expiresAt = expiresAt;
    current.benefits = this.getTierBenefits(newTier);

    this.subscriptions.set(current.id, current);
    return current;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string): Promise<boolean> {
    const sub = await this.getSubscription(userId);
    if (!sub) return false;

    sub.status = 'expired';
    this.subscriptions.set(sub.id, sub);
    return true;
  }

  /**
   * Get VIP pricing
   */
  async getPricing(): Promise<{
    tier: VIPTier;
    price: number;
    period: string;
  }[]> {
    return [
      { tier: 'platinum', price: 299, period: 'month' },
      { tier: 'gold', price: 499, period: 'month' },
      { tier: 'diamond', price: 799, period: 'month' },
    ];
  }
}