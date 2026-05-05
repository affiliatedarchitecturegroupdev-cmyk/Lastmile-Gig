import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export type IncentiveType = 'peak_hour' | 'distance' | 'referral' | 'achievement' | 'weekly_goal';

export interface IncentiveRule {
  id: string;
  name: string;
  type: IncentiveType;
  multiplier: number;
  bonusAmount: number;
  minOrders?: number;
  minDistance?: number;
  active: boolean;
  startTime?: string;
  endTime?: string;
  days?: string[];
}

export interface DriverIncentive {
  id: string;
  driverId: string;
  ruleId: string;
  type: IncentiveType;
  amount: number;
  orderId?: string;
  earnedAt: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  reward: number;
  unlockedAt?: Date;
}

@Injectable()
export class DriverIncentivesService {
  private rules: Map<string, IncentiveRule> = new Map();
  private achievements: Map<string, Achievement[]> = new Map();

  constructor() {
    this.loadRules();
    this.loadAchievements();
  }

  private loadRules(): void {
    const rules: IncentiveRule[] = [
      // Peak hour bonuses
      { id: 'r1', name: 'Lunch Rush', type: 'peak_hour', multiplier: 1.5, bonusAmount: 0, active: true, startTime: '12:00', endTime: '14:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
      { id: 'r2', name: 'Dinner Rush', type: 'peak_hour', multiplier: 1.5, bonusAmount: 0, active: true, startTime: '18:00', endTime: '21:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
      { id: 'r3', name: 'Weekend Boost', type: 'peak_hour', multiplier: 2.0, bonusAmount: 0, active: true, startTime: '12:00', endTime: '23:00', days: ['Sat', 'Sun'] },
      
      // Distance bonuses
      { id: 'r4', name: 'Long Distance Bonus', type: 'distance', multiplier: 1.0, bonusAmount: 15, minDistance: 10, active: true },
      { id: 'r5', name: 'Extra Long Distance', type: 'distance', multiplier: 1.0, bonusAmount: 25, minDistance: 20, active: true },
      
      // Weekly goals
      { id: 'r6', name: '20 Orders Week', type: 'weekly_goal', multiplier: 1.0, bonusAmount: 200, minOrders: 20, active: true },
      { id: 'r7', name: '50 Orders Week', type: 'weekly_goal', multiplier: 1.0, bonusAmount: 500, minOrders: 50, active: true },
      { id: 'r8', name: '100 Orders Month', type: 'weekly_goal', multiplier: 1.0, bonusAmount: 1500, minOrders: 100, active: true },
    ];

    for (const r of rules) {
      this.rules.set(r.id, r);
    }
  }

  private loadAchievements(): void {
    const achievements: Achievement[] = [
      { id: 'a1', name: 'First Delivery', description: 'Complete your first delivery', icon: '🎯', requirement: 1, reward: 50 },
      { id: 'a2', name: 'Rising Star', description: 'Complete 50 deliveries', icon: '⭐', requirement: 50, reward: 250 },
      { id: 'a3', name: 'Pro Driver', description: 'Complete 200 deliveries', icon: '🌟', requirement: 200, reward: 1000 },
      { id: 'a4', name: 'Legend', description: 'Complete 500 deliveries', icon: '🏆', requirement: 500, reward: 2500 },
      { id: 'a5', name: 'Speed Demon', description: 'Complete 10 deliveries in one day', icon: '⚡', requirement: 10, reward: 150 },
      { id: 'a6', name: 'Perfect Week', description: 'Complete 50 deliveries in a week', icon: '💪', requirement: 50, reward: 500 },
    ];
    
    this.achievements.set('default', achievements);
  }

  /**
   * Calculate incentive for order
   */
  async calculateIncentive(driverId: string, orderId: string, orderAmount: number, distance: number): Promise<{
    baseEarnings: number;
    incentiveAmount: number;
    totalEarnings: number;
    appliedRules: string[];
  }> {
    const appliedRules: string[] = [];
    let incentiveAmount = 0;
    const now = new Date();
    
    // Check peak hour rules
    for (const rule of this.rules.values()) {
      if (!rule.active) continue;
      
      if (rule.type === 'peak_hour' && this.isPeakHour(rule, now)) {
        incentiveAmount += orderAmount * (rule.multiplier - 1);
        appliedRules.push(rule.name);
      }
      
      if (rule.type === 'distance' && distance >= (rule.minDistance || 0)) {
        incentiveAmount += rule.bonusAmount;
        appliedRules.push(rule.name);
      }
    }

    const baseEarnings = orderAmount;
    const totalEarnings = baseEarnings + incentiveAmount;

    return {
      baseEarnings,
      incentiveAmount: Math.round(incentiveAmount * 100) / 100,
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      appliedRules,
    };
  }

  /**
   * Check if current time is peak hour
   */
  private isPeakHour(rule: IncentiveRule, now: Date): boolean {
    if (!rule.startTime || !rule.endTime) return false;
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDay = dayNames[now.getDay()];
    
    if (rule.days && !rule.days.includes(currentDay)) return false;
    
    const currentHour = now.getHours();
    const [startHour] = rule.startTime.split(':').map(Number);
    const [endHour] = rule.endTime.split(':').map(Number);
    
    return currentHour >= startHour && currentHour < endHour;
  }

  /**
   * Get active incentives
   */
  async getActiveIncentives(): Promise<IncentiveRule[]> {
    return Array.from(this.rules.values()).filter(r => r.active);
  }

  /**
   * Get driver earnings summary
   */
  async getDriverEarnings(driverId: string, period: 'daily' | 'weekly' | 'monthly'): Promise<{
    baseEarnings: number;
    incentives: number;
    achievements: number;
    totalEarnings: number;
    orderCount: number;
  }> {
    const multiplier = period === 'daily' ? 1 : period === 'weekly' ? 7 : 30;
    
    return {
      baseEarnings: Math.floor(Math.random() * 5000) * multiplier,
      incentives: Math.floor(Math.random() * 1000) * multiplier,
      achievements: Math.floor(Math.random() * 500) * multiplier,
      totalEarnings: Math.floor(Math.random() * 6500) * multiplier,
      orderCount: Math.floor(Math.random() * 100) * multiplier,
    };
  }

  /**
   * Check weekly goal progress
   */
  async checkWeeklyGoals(driverId: string): Promise<{
    goalId: string;
    name: string;
    current: number;
    target: number;
    progress: number;
    eligible: boolean;
  }[]> {
    const goals = [
      { goalId: 'r6', name: '20 Orders Week', target: 20 },
      { goalId: 'r7', name: '50 Orders Week', target: 50 },
      { goalId: 'r8', name: '100 Orders Month', target: 100 },
    ];

    return goals.map(g => {
      const current = Math.floor(Math.random() * g.target);
      return {
        ...g,
        current,
        progress: (current / g.target) * 100,
        eligible: current >= g.target,
      };
    });
  }

  /**
   * Get driver achievements
   */
  async getDriverAchievements(driverId: string): Promise<Achievement[]> {
    const achievements = this.achievements.get('default') || [];
    return achievements.map(a => ({
      ...a,
      unlockedAt: Math.random() > 0.5 ? new Date() : undefined,
    }));
  }

  /**
   * Unlock achievement
   */
  async unlockAchievement(driverId: string, achievementId: string): Promise<{
    unlocked: boolean;
    reward: number;
  }> {
    return {
      unlocked: true,
      reward: 100,
    };
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(period: 'daily' | 'weekly'): Promise<{
    rank: number;
    driverId: string;
    driverName: string;
    orders: number;
    earnings: number;
  }[]> {
    const drivers = [];
    for (let i = 0; i < 10; i++) {
      drivers.push({
        rank: i + 1,
        driverId: `d${i + 1}`,
        driverName: `Driver ${i + 1}`,
        orders: Math.floor(Math.random() * 50) + 10,
        earnings: Math.floor(Math.random() * 2000) + 500,
      });
    }
    return drivers.sort((a, b) => b.orders - a.orders);
  }

  /**
   * Get referral stats
   */
  async getReferralStats(driverId: string): Promise<{
    referrals: number;
    activeReferrals: number;
    totalEarnings: number;
  }> {
    return {
      referrals: Math.floor(Math.random() * 10),
      activeReferrals: Math.floor(Math.random() * 5),
      totalEarnings: Math.floor(Math.random() * 2000),
    };
  }
}