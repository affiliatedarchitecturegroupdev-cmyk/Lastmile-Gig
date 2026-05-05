import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface ReferralCode {
  id: string;
  userId: string;
  code: string;
  uses: number;
  maxUses: number;
  reward: {
    referrerAmount: number;
    refereeDiscount: number;
  };
  createdAt: Date;
  expiresAt: Date;
}

export interface Referral {
  id: string;
  referrerId: string;
  refereeId: string;
  refereeEmail: string;
  status: 'pending' | 'signed_up' | 'completed' | 'rewarded';
  referredAt: Date;
  signedUpAt?: Date;
  completedAt?: Date;
  rewardAmount?: number;
}

export interface ReferralStats {
  userId: string;
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  totalEarned: number;
}

@Injectable()
export class ReferralService {
  private codes: Map<string, ReferralCode> = new Map();
  private referrals: Map<string, Referral[]> = new Map();

  /**
   * Generate referral code for user
   */
  async generateReferralCode(userId: string): Promise<ReferralCode> {
    const code = this.generateCode();
    
    const referralCode: ReferralCode = {
      id: uuidv4(),
      userId,
      code,
      uses: 0,
      maxUses: 50,
      reward: {
        referrerAmount: 100, // R100 credit for referrer
        refereeDiscount: 50, // R50 discount for referee
      },
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    };

    this.codes.set(code, referralCode);
    return referralCode;
  }

  /**
   * Generate unique code
   */
  private generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'LM';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Get user's referral code
   */
  async getReferralCode(userId: string): Promise<ReferralCode | null> {
    for (const code of this.codes.values()) {
      if (code.userId === userId) return code;
    }
    return this.generateReferralCode(userId);
  }

  /**
   * Verify referral code
   */
  async verifyCode(code: string): Promise<ReferralCode | null> {
    const referralCode = this.codes.get(code);
    if (!referralCode) return null;
    
    if (referralCode.uses >= referralCode.maxUses) return null;
    if (referralCode.expiresAt < new Date()) return null;
    
    return referralCode;
  }

  /**
   * Record referral
   */
  async recordReferral(
    referrerId: string,
    refereeEmail: string,
    refereeId?: string
  ): Promise<Referral> {
    const referral: Referral = {
      id: uuidv4(),
      referrerId,
      refereeId: refereeId || '',
      refereeEmail,
      status: refereeId ? 'signed_up' : 'pending',
      referredAt: new Date(),
    };

    const userReferrals = this.referrals.get(referrerId) || [];
    userReferrals.push(referral);
    this.referrals.set(referrerId, userReferrals);

    // Update code uses
    const code = await this.getReferralCode(referrerId);
    if (code) {
      code.uses++;
      this.codes.set(code.code, code);
    }

    return referral;
  }

  /**
   * Mark referral as completed
   */
  async completeReferral(
    referralId: string,
    refereeId: string
  ): Promise<Referral | null> {
    for (const [referrerId, referrals] of this.referrals.entries()) {
      const referral = referrals.find(r => r.id === referralId);
      if (referral) {
        referral.status = 'completed';
        referral.completedAt = new Date();
        referral.refereeId = refereeId;
        this.referrals.set(referrerId, referrals);
        return referral;
      }
    }
    return null;
  }

  /**
   * Award referral reward
   */
  async awardReward(referralId: string): Promise<number> {
    for (const [referrerId, referrals] of this.referrals.entries()) {
      const referral = referrals.find(r => r.id === referralId);
      if (referral && referral.status === 'completed') {
        const code = await this.getReferralCode(referrerId);
        const rewardAmount = code?.reward.referrerAmount || 100;
        
        referral.status = 'rewarded';
        referral.rewardAmount = rewardAmount;
        this.referrals.set(referrerId, referrals);
        
        return rewardAmount;
      }
    }
    return 0;
  }

  /**
   * Get referral stats
   */
  async getReferralStats(userId: string): Promise<ReferralStats> {
    const referrals = this.referrals.get(userId) || [];
    
    return {
      userId,
      totalReferrals: referrals.length,
      successfulReferrals: referrals.filter(r => r.status === 'rewarded').length,
      pendingReferrals: referrals.filter(r => r.status === 'pending' || r.status === 'signed_up').length,
      totalEarned: referrals.reduce((sum, r) => sum + (r.rewardAmount || 0), 0),
    };
  }

  /**
   * Get user's referrals
   */
  async getUserReferrals(userId: string): Promise<Referral[]> {
    return this.referrals.get(userId) || [];
  }

  /**
   * Apply referee discount
   */
  async applyRefereeDiscount(
    userId: string,
    orderTotal: number
  ): Promise<{ discount: number; code: string }> {
    const code = await this.getReferralCode(userId);
    const discount = code?.reward.refereeDiscount || 50;
    
    return {
      discount: Math.min(discount, orderTotal * 0.5), // Max 50% of order
      code: code?.code || '',
    };
  }

  /**
   * Get top referrers
   */
  async getTopReferrers(limit: number = 10): Promise<{
    rank: number;
    userId: string;
    referrals: number;
    earned: number;
  }[]> {
    const stats: any[] = [];
    
    for (const [userId, referrals] of this.referrals.entries()) {
      stats.push({
        userId,
        referrals: referrals.filter(r => r.status === 'rewarded').length,
        earned: referrals.reduce((sum, r) => sum + (r.rewardAmount || 0), 0),
      });
    }
    
    return stats
      .sort((a, b) => b.referrals - a.referrals)
      .slice(0, limit)
      .map((s, i) => ({ rank: i + 1, ...s }));
  }

  /**
   * Check referral eligibility
   */
  async checkEligibility(userId: string): Promise<{
    eligible: boolean;
    reason?: string;
    pendingInvites: number;
  }> {
    const referral = await this.getReferralStats(userId);
    const pending = referral.pendingReferrals;
    
    return {
      eligible: pending < 20,
      reason: pending >= 20 ? 'Maximum pending referrals reached' : undefined,
      pendingInvites: pending,
    };
  }
}