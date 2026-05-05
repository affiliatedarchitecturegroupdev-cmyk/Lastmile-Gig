import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface DriverReferral {
  id: string;
  referrerId: string;
  refereeId?: string;
  code: string;
  status: 'pending' | 'signed_up' | 'completed';
  bonusAmount: number;
  createdAt: Date;
  completedAt?: Date;
}

@Injectable()
export class DriverReferralService {
  private referrals: Map<string, DriverReferral> = new Map();

  async createReferral(referrerId: string): Promise<DriverReferral> {
    const code = `DRV${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const referral: DriverReferral = { id: uuidv4(), referrerId, code, status: 'pending', bonusAmount: 500, createdAt: new Date() };
    this.referrals.set(referral.id, referral);
    return referral;
  }

  async getReferral(code: string): Promise<DriverReferral | null> {
    for (const r of this.referrals.values()) { if (r.code === code) return r; }
    return null;
  }

  async useReferral(code: string, refereeId: string): Promise<boolean> {
    const referral = await this.getReferral(code);
    if (!referral) return false;
    referral.refereeId = refereeId;
    referral.status = 'signed_up';
    return true;
  }

  async completeReferral(code: string): Promise<boolean> {
    const referral = await this.getReferral(code);
    if (!referral || referral.status !== 'signed_up') return false;
    referral.status = 'completed';
    referral.completedAt = new Date();
    return true;
  }

  async getReferrerStats(referrerId: string): Promise<{ totalReferrals: number; completed: number; earnings: number }> {
    const refs = Array.from(this.referrals.values()).filter(r => r.referrerId === referrerId);
    return { totalReferrals: refs.length, completed: refs.filter(r => r.status === 'completed').length, earnings: refs.filter(r => r.status === 'completed').length * 500 };
  }

  async getLeaderboard(): Promise<{ driverId: string; referrals: number }[]> {
    return Array.from(this.referrals.values()).reduce((acc: any[], r) => {
      const existing = acc.find(a => a.driverId === r.referrerId);
      if (existing) existing.referrals++;
      else acc.push({ driverId: r.referrerId, referrals: 1 });
      return acc;
    }, []).sort((a: any, b: any) => b.referrals - a.referrals).slice(0, 10);
  }
}