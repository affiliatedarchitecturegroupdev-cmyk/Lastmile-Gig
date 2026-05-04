import { Injectable } from '@nestjs/common';

export type PointsTransactionType = 'earn' | 'redeem' | 'bonus' | 'expire' | 'adjust';

export interface PointsTransaction {
  id: string;
  userId: string;
  orderId?: string;
  type: PointsTransactionType;
  points: number;
  balanceAfter: number;
  description: string;
  timestamp: Date;
}

export interface CustomerPoints {
  userId: string;
  currentBalance: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  tierProgress: number;
  nextTierPoints: number;
  memberSince: Date;
}

@Injectable()
export class LoyaltyPointsService {
  private points: Map<string, CustomerPoints> = new Map();
  private transactions: Map<string, PointsTransaction[]> = new Map();
  private tierThresholds = {
    bronze: 0,
    silver: 5000,
    gold: 15000,
    platinum: 50000,
  };

  /**
   * Get customer points profile
   */
  async getCustomerPoints(userId: string): Promise<CustomerPoints> {
    let profile = this.points.get(userId);
    
    if (!profile) {
      profile = {
        userId,
        currentBalance: 0,
        lifetimeEarned: 0,
        lifetimeRedeemed: 0,
        tier: 'bronze',
        tierProgress: 0,
        nextTierPoints: 5000,
        memberSince: new Date(),
      };
      this.points.set(userId, profile);
    }

    // Update tier based on lifetime earned
    profile.tier = this.calculateTier(profile.lifetimeEarned);
    profile.nextTierPoints = this.getNextTierThreshold(profile.tier);
    profile.tierProgress = this.calculateTierProgress(profile.lifetimeEarned, profile.tier);

    return profile;
  }

  /**
   * Calculate tier from lifetime points
   */
  private calculateTier(lifetimeEarned: number): 'bronze' | 'silver' | 'gold' | 'platinum' {
    if (lifetimeEarned >= this.tierThresholds.platinum) return 'platinum';
    if (lifetimeEarned >= this.tierThresholds.gold) return 'gold';
    if (lifetimeEarned >= this.tierThresholds.silver) return 'silver';
    return 'bronze';
  }

  /**
   * Get next tier threshold
   */
  private getNextTierThreshold(currentTier: string): number {
    switch (currentTier) {
      case 'bronze': return this.tierThresholds.silver;
      case 'silver': return this.tierThresholds.gold;
      case 'gold': return this.tierThresholds.platinum;
      default: return 0;
    }
  }

  /**
   * Calculate tier progress percentage
   */
  private calculateTierProgress(lifetimeEarned: number, tier: string): number {
    const currentThreshold = this.tierThresholds[tier as keyof typeof this.tierThresholds] || 0;
    const nextThreshold = this.getNextTierThreshold(tier);
    const range = nextThreshold - currentThreshold;
    const progress = lifetimeEarned - currentThreshold;
    
    return range > 0 ? Math.min(100, (progress / range) * 100) : 100;
  }

  /**
   * Earn points from order
   */
  async earnPoints(data: {
    userId: string;
    orderId: string;
    orderValue: number;
    bonusMultiplier?: number;
  }): Promise<PointsTransaction> {
    const profile = await this.getCustomerPoints(data.userId);
    
    // Calculate points: 1 point per R1, multiplied by tier bonus
    const tierMultiplier = this.getTierMultiplier(profile.tier);
    const basePoints = Math.floor(data.orderValue);
    const multiplier = data.bonusMultiplier || 1;
    const totalPoints = Math.floor(basePoints * tierMultiplier * multiplier);

    // Add bonus points for GigaPass members
    const gigaPassBonus = await this.checkGigaPass(data.userId) ? 500 : 0;
    const finalPoints = totalPoints + gigaPassBonus;

    // Update profile
    profile.currentBalance += finalPoints;
    profile.lifetimeEarned += finalPoints;
    this.points.set(data.userId, profile);

    // Create transaction
    const transaction = await this.createTransaction({
      userId: data.userId,
      orderId: data.orderId,
      type: 'earn',
      points: finalPoints,
      balanceAfter: profile.currentBalance,
      description: `Earned ${finalPoints} points from order #${data.orderId}`,
    });

    return transaction;
  }

  /**
   * Get tier multiplier
   */
  private getTierMultiplier(tier: string): number {
    switch (tier) {
      case 'platinum': return 2.0;
      case 'gold': return 1.5;
      case 'silver': return 1.25;
      default: return 1.0;
    }
  }

  /**
   * Redeem points
   */
  async redeemPoints(data: {
    userId: string;
    rewardId: string;
    pointsCost: number;
  }): Promise<PointsTransaction> {
    const profile = await this.getCustomerPoints(data.userId);
    
    if (profile.currentBalance < data.pointsCost) {
      throw new Error('Insufficient points');
    }

    profile.currentBalance -= data.pointsCost;
    profile.lifetimeRedeemed += data.pointsCost;
    this.points.set(data.userId, profile);

    return this.createTransaction({
      userId: data.userId,
      type: 'redeem',
      points: -data.pointsCost, // Negative for redemption
      balanceAfter: profile.currentBalance,
      description: `Redeemed ${data.pointsCost} points for reward`,
    });
  }

  /**
   * Create transaction record
   */
  private async createTransaction(data: {
    userId: string;
    orderId?: string;
    type: PointsTransactionType;
    points: number;
    balanceAfter: number;
    description: string;
  }): Promise<PointsTransaction> {
    const transaction: PointsTransaction = {
      id: `txn_${Date.now()}`,
      ...data,
      timestamp: new Date(),
    };

    const userTransactions = this.transactions.get(data.userId) || [];
    userTransactions.push(transaction);
    this.transactions.set(data.userId, userTransactions);

    return transaction;
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(
    userId: string,
    limit: number = 20
  ): Promise<PointsTransaction[]> {
    const transactions = this.transactions.get(userId) || [];
    return transactions.slice(-limit).reverse();
  }

  /**
   * Check if user has GigaPass
   */
  private async checkGigaPass(userId: string): Promise<boolean> {
    // Would check subscription service
    return false;
  }

  /**
   * Check points expiration
   */
  async checkExpiration(userId: string): Promise<{
    expiringPoints: number;
    expirationDate: Date;
  }> {
    const profile = await this.getCustomerPoints(userId);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Points older than 1 year expire
    const userTransactions = this.transactions.get(userId) || [];
    const expiring = userTransactions.filter(t => 
      t.type === 'earn' && t.timestamp < oneYearAgo
    ).reduce((sum, t) => sum + t.points, 0);

    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);

    return {
      expiringPoints: expiring,
      expirationDate,
    };
  }

  /**
   * Calculate points value
   */
  calculatePointsValue(points: number): number {
    return points * 0.05; // R0.05 per point
  }

  /**
   * Get tier benefits
   */
  async getTierBenefits(tier: string): Promise<string[]> {
    const benefits: Record<string, string[]> = {
      bronze: ['Earn 1x points', 'Birthday bonus'],
      silver: ['Earn 1.25x points', 'Birthday bonus', 'Free delivery'],
      gold: ['Earn 1.5x points', 'Priority support', 'Free delivery', 'Exclusive deals'],
      platinum: ['Earn 2x points', 'Dedicated support', 'Free delivery', 'Exclusive deals', 'Free items'],
    };
    return benefits[tier] || [];
  }
}