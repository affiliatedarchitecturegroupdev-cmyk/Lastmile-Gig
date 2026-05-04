import { Injectable } from '@nestjs/common';

export type RewardCategory = 'discount' | 'free_delivery' | 'product' | 'voucher';
export type RewardStatus = 'active' | 'paused' | 'redeemed' | 'expired';

export interface Reward {
  id: string;
  name: string;
  description: string;
  category: RewardCategory;
  pointsCost: number;
  value: number; // monetary value in ZAR
  quantity: number;
  quantityRemaining: number;
  minimumTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  expiresAt?: Date;
  status: RewardStatus;
  imageUrl?: string;
}

export interface RedeemedReward {
  id: string;
  userId: string;
  rewardId: string;
  pointsSpent: number;
  rewardValue: number;
  redeemedAt: Date;
  voucherCode?: string;
}

@Injectable()
export class RewardsCatalogService {
  private rewards: Map<string, Reward> = new Map();
  private redemptions: Map<string, RedeemedReward[]> = new Map();
  
  constructor() {
    this.initializeRewards();
  }

  private initializeRewards(): void {
    const rewards: Reward[] = [
      { id: 'r001', name: 'R10 Off', description: 'R10 off your next order', category: 'discount', pointsCost: 200, value: 10, quantity: 100, quantityRemaining: 100, minimumTier: 'bronze', status: 'active' },
      { id: 'r002', name: 'R25 Off', description: 'R25 off your next order', category: 'discount', pointsCost: 450, value: 25, quantity: 50, quantityRemaining: 50, minimumTier: 'bronze', status: 'active' },
      { id: 'r003', name: 'R50 Off', description: 'R50 off your next order', category: 'discount', pointsCost: 800, value: 50, quantity: 30, quantityRemaining: 30, minimumTier: 'silver', status: 'active' },
      { id: 'r004', name: 'Free Delivery', description: 'Free delivery on any order', category: 'free_delivery', pointsCost: 300, value: 35, quantity: 200, quantityRemaining: 200, minimumTier: 'bronze', status: 'active' },
      { id: 'r005', name: 'Free Burger', description: 'Free burger from selected partners', category: 'product', pointsCost: 1500, value: 120, quantity: 20, quantityRemaining: 20, minimumTier: 'gold', status: 'active' },
      { id: 'r006', name: 'R100 Voucher', description: 'R100 partner voucher', category: 'voucher', pointsCost: 1800, value: 100, quantity: 15, quantityRemaining: 15, minimumTier: 'gold', status: 'active' },
      { id: 'r007', name: 'R250 Voucher', description: 'R250 partner voucher', category: 'voucher', pointsCost: 4000, value: 250, quantity: 10, quantityRemaining: 10, minimumTier: 'platinum', status: 'active' },
      { id: 'r008', name: 'Free Pizza', description: 'Free medium pizza', category: 'product', pointsCost: 2000, value: 180, quantity: 15, quantityRemaining: 15, minimumTier: 'gold', status: 'active' },
    ];

    for (const reward of rewards) {
      this.rewards.set(reward.id, reward);
    }
  }

  /**
   * Get all available rewards
   */
  async getAvailableRewards(tier?: string): Promise<Reward[]> {
    const all = Array.from(this.rewards.values());
    
    if (tier) {
      const tierOrder = ['bronze', 'silver', 'gold', 'platinum'];
      const tierIndex = tierOrder.indexOf(tier);
      return all.filter(r => 
        r.status === 'active' && 
        r.quantityRemaining > 0 &&
        tierOrder.indexOf(r.minimumTier) <= tierIndex
      );
    }
    
    return all.filter(r => r.status === 'active' && r.quantityRemaining > 0);
  }

  /**
   * Get reward by ID
   */
  async getReward(rewardId: string): Promise<Reward | null> {
    return this.rewards.get(rewardId) || null;
  }

  /**
   * Redeem reward
   */
  async redeemReward(data: {
    userId: string;
    rewardId: string;
  }): Promise<RedeemedReward> {
    const reward = this.rewards.get(data.rewardId);
    
    if (!reward || reward.status !== 'active') {
      throw new Error('Reward not available');
    }

    if (reward.quantityRemaining <= 0) {
      throw new Error('Reward out of stock');
    }

    // Decrement quantity
    reward.quantityRemaining--;
    this.rewards.set(data.rewardId, reward);

    // Generate voucher code
    const voucherCode = `V${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const redemption: RedeemedReward = {
      id: `red_${Date.now()}`,
      userId: data.userId,
      rewardId: data.rewardId,
      pointsSpent: reward.pointsCost,
      rewardValue: reward.value,
      redeemedAt: new Date(),
      voucherCode,
    };

    const userRedemptions = this.redemptions.get(data.userId) || [];
    userRedemptions.push(redemption);
    this.redemptions.set(data.userId, userRedemptions);

    return redemption;
  }

  /**
   * Get user's redeemed rewards
   */
  async getUserRedemptions(userId: string): Promise<RedeemedReward[]> {
    return this.redemptions.get(userId) || [];
  }

  /**
   * Get rewards by category
   */
  async getRewardsByCategory(category: RewardCategory): Promise<Reward[]> {
    return Array.from(this.rewards.values())
      .filter(r => r.category === category && r.status === 'active');
  }

  /**
   * Check reward eligibility
   */
  async checkEligibility(userId: string, rewardId: string): Promise<{
    eligible: boolean;
    reason?: string;
  }> {
    const reward = this.rewards.get(rewardId);
    if (!reward) return { eligible: false, reason: 'Reward not found' };

    if (reward.quantityRemaining <= 0) {
      return { eligible: false, reason: 'Reward out of stock' };
    }

    if (reward.expiresAt && reward.expiresAt < new Date()) {
      return { eligible: false, reason: 'Reward expired' };
    }

    return { eligible: true };
  }

  /**
   * Get rewards summary
   */
  async getRewardsSummary(): Promise<{
    totalRewards: number;
    byCategory: Record<string, number>;
    averageValue: number;
  }> {
    const all = Array.from(this.rewards.values());
    
    return {
      totalRewards: all.length,
      byCategory: {
        discount: all.filter(r => r.category === 'discount').length,
        free_delivery: all.filter(r => r.category === 'free_delivery').length,
        product: all.filter(r => r.category === 'product').length,
        voucher: all.filter(r => r.category === 'voucher').length,
      },
      averageValue: all.reduce((sum, r) => sum + r.value, 0) / all.length,
    };
  }
}