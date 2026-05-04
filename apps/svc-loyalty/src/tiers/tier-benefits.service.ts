import { Injectable } from '@nestjs/common';

export type TierName = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface TierBenefit {
  id: string;
  name: string;
  description: string;
  tier: TierName;
  benefitType: 'points_multiplier' | 'discount' | 'free_delivery' | 'support' | 'exclusive';
  value: number;
  icon: string;
}

export interface TierInfo {
  name: TierName;
  displayName: string;
  threshold: number;
  color: string;
  benefits: TierBenefit[];
}

@Injectable()
export class TierBenefitsService {
  private tiers: Map<TierName, TierInfo> = new Map();

  constructor() {
    this.initializeTiers();
  }

  private initializeTiers(): void {
    this.tiers.set('bronze', {
      name: 'bronze',
      displayName: 'Bronze',
      threshold: 0,
      color: '#CD7F32',
      benefits: [
        { id: 'b1', name: 'Earn Points', description: 'Earn 1 point per R1 spent', tier: 'bronze', benefitType: 'points_multiplier', value: 1, icon: '💰' },
        { id: 'b2', name: 'Birthday Bonus', description: 'Double points on birthday month', tier: 'bronze', benefitType: 'points_multiplier', value: 2, icon: '🎂' },
      ],
    });

    this.tiers.set('silver', {
      name: 'silver',
      displayName: 'Silver',
      threshold: 5000,
      color: '#C0C0C0',
      benefits: [
        { id: 's1', name: 'Earn Points', description: 'Earn 1.25 points per R1 spent', tier: 'silver', benefitType: 'points_multiplier', value: 1.25, icon: '💰' },
        { id: 's2', name: 'Birthday Bonus', description: 'Double points on birthday month', tier: 'silver', benefitType: 'points_multiplier', value: 2, icon: '🎂' },
        { id: 's3', name: 'Free Delivery', description: 'Free delivery on orders over R150', tier: 'silver', benefitType: 'free_delivery', value: 150, icon: '🚚' },
        { id: 's4', name: 'Priority Support', description: 'Faster customer support', tier: 'silver', benefitType: 'support', value: 1, icon: '📞' },
      ],
    });

    this.tiers.set('gold', {
      name: 'gold',
      displayName: 'Gold',
      threshold: 15000,
      color: '#FFD700',
      benefits: [
        { id: 'g1', name: 'Earn Points', description: 'Earn 1.5 points per R1 spent', tier: 'gold', benefitType: 'points_multiplier', value: 1.5, icon: '💰' },
        { id: 'g2', name: 'Birthday Bonus', description: 'Double points on birthday month', tier: 'gold', benefitType: 'points_multiplier', value: 2, icon: '🎂' },
        { id: 'g3', name: 'Free Delivery', description: 'Free delivery on all orders', tier: 'gold', benefitType: 'free_delivery', value: 0, icon: '🚚' },
        { id: 'g4', name: 'Priority Support', description: 'Priority customer support', tier: 'gold', benefitType: 'support', value: 1, icon: '📞' },
        { id: 'g5', name: 'Exclusive Deals', description: 'Access to exclusive deals', tier: 'gold', benefitType: 'exclusive', value: 1, icon: '🏆' },
      ],
    });

    this.tiers.set('platinum', {
      name: 'platinum',
      displayName: 'Platinum',
      threshold: 50000,
      color: '#E5E4E2',
      benefits: [
        { id: 'p1', name: 'Earn Points', description: 'Earn 2 points per R1 spent', tier: 'platinum', benefitType: 'points_multiplier', value: 2, icon: '💰' },
        { id: 'p2', name: 'Birthday Bonus', description: 'Double points on birthday month', tier: 'platinum', benefitType: 'points_multiplier', value: 2, icon: '🎂' },
        { id: 'p3', name: 'Free Delivery', description: 'Free delivery on all orders', tier: 'platinum', benefitType: 'free_delivery', value: 0, icon: '🚚' },
        { id: 'p4', name: 'Dedicated Support', description: 'Dedicated account manager', tier: 'platinum', benefitType: 'support', value: 1, icon: '👤' },
        { id: 'p5', name: 'Exclusive Deals', description: 'Best exclusive deals', tier: 'platinum', benefitType: 'exclusive', value: 1, icon: '🏆' },
        { id: 'p6', name: 'Free Items', description: 'Free monthly items', tier: 'platinum', benefitType: 'free_delivery', value: 1, icon: '🎁' },
      ],
    });
  }

  /**
   * Get all tier information
   */
  async getAllTiers(): Promise<TierInfo[]> {
    return Array.from(this.tiers.values());
  }

  /**
   * Get tier by name
   */
  async getTier(tierName: TierName): Promise<TierInfo | null> {
    return this.tiers.get(tierName) || null;
  }

  /**
   * Calculate points needed for tier
   */
  async getPointsToNextTier(currentTier: TierName, currentPoints: number): Promise<{
    nextTier: TierName | null;
    pointsNeeded: number;
    progressPercent: number;
  }> {
    const tierOrder: TierName[] = ['bronze', 'silver', 'gold', 'platinum'];
    const currentIndex = tierOrder.indexOf(currentTier);
    
    if (currentIndex >= tierOrder.length - 1) {
      return { nextTier: null, pointsNeeded: 0, progressPercent: 100 };
    }

    const nextTier = tierOrder[currentIndex + 1];
    const nextTierInfo = this.tiers.get(nextTier)!;
    const pointsNeeded = nextTierInfo.threshold - currentPoints;
    const currentTierInfo = this.tiers.get(currentTier)!;
    const tierRange = nextTierInfo.threshold - currentTierInfo.threshold;
    const progress = currentPoints - currentTierInfo.threshold;
    const progressPercent = (progress / tierRange) * 100;

    return {
      nextTier,
      pointsNeeded: Math.max(0, pointsNeeded),
      progressPercent: Math.min(100, progressPercent),
    };
  }

  /**
   * Get benefit value
   */
  calculateBenefitValue(tier: TierName, benefitType: string): number {
    const tierInfo = this.tiers.get(tier);
    if (!tierInfo) return 0;

    const benefit = tierInfo.benefits.find(b => b.benefitType === benefitType);
    return benefit?.value || 0;
  }

  /**
   * Get tier comparison
   */
  async getTierComparison(): Promise<{
    tier: string;
    threshold: number;
    multiplier: number;
    color: string;
  }[]> {
    return [
      { tier: 'Bronze', threshold: 0, multiplier: 1, color: '#CD7F32' },
      { tier: 'Silver', threshold: 5000, multiplier: 1.25, color: '#C0C0C0' },
      { tier: 'Gold', threshold: 15000, multiplier: 1.5, color: '#FFD700' },
      { tier: 'Platinum', threshold: 50000, multiplier: 2, color: '#E5E4E2' },
    ];
  }
}