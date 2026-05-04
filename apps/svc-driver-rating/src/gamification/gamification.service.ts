import { Injectable } from '@nestjs/common';

export type BadgeType = 'milestone' | 'achievement' | 'streak' | 'special';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: BadgeType;
  requirement: string;
  unlockedAt?: Date;
}

export interface DriverReward {
  driverId: string;
  points: number;
  level: number;
  badges: Badge[];
  streak: number;
  totalEarnings: number;
}

export interface Bonus {
  id: string;
  type: 'peak' | 'referral' | 'milestone' | 'safety';
  amount: number;
  description: string;
  criteria: string;
}

@Injectable()
export class GamificationService {
  private rewards: Map<string, DriverReward> = new Map();
  private bonuses: Bonus[] = this.initializeBonuses();

  private initializeBonuses(): Bonus[] {
    return [
      { id: 'peak_lunch', type: 'peak', amount: 15, description: 'R15 extra per delivery during lunch', criteria: '11:00-14:00' },
      { id: 'peak_dinner', type: 'peak', amount: 20, description: 'R20 extra per delivery during dinner', criteria: '18:00-21:00' },
      { id: 'referral_bonus', type: 'referral', amount: 500, description: 'R500 for each new driver referred' },
      { id: '100_orders', type: 'milestone', amount: 1000, description: 'R1000 bonus for 100 orders', criteria: '100 orders' },
      { id: '500_orders', type: 'milestone', amount: 2500, description: 'R2500 bonus for 500 orders', criteria: '500 orders' },
      { id: 'safety_bonus', type: 'safety', amount: 500, description: 'R500 for safe driving', criteria: 'no accidents' },
    ];
  }

  /**
   * Get or create driver reward profile
   */
  async getDriverReward(driverId: string): Promise<DriverReward> {
    let reward = this.rewards.get(driverId);
    
    if (!reward) {
      reward = {
        driverId,
        points: 0,
        level: 1,
        badges: [],
        streak: 0,
        totalEarnings: 0,
      };
      this.rewards.set(driverId, reward);
    }

    return reward;
  }

  /**
   * Add points to driver
   */
  async addPoints(driverId: string, points: number): Promise<DriverReward> {
    const reward = await this.getDriverReward(driverId);
    reward.points += points;
    reward.totalEarnings += points * 0.1; // 0.1 ZAR per point
    
    // Check level up
    const newLevel = Math.floor(reward.points / 1000) + 1;
    if (newLevel > reward.level) {
      reward.level = newLevel;
      // Could unlock badge here
    }

    this.rewards.set(driverId, reward);
    return reward;
  }

  /**
   * Award badge to driver
   */
  async awardBadge(driverId: string, badge: Badge): Promise<DriverReward> {
    const reward = await this.getDriverReward(driverId);
    badge.unlockedAt = new Date();
    reward.badges.push(badge);
    
    // Bonus points for badge
    reward.points += 100;
    
    this.rewards.set(driverId, reward);
    return reward;
  }

  /**
   * Update streak
   */
  async updateStreak(driverId: string, delivered: boolean): Promise<DriverReward> {
    const reward = await this.getDriverReward(driverId);
    
    if (delivered) {
      reward.streak++;
      // Weekly bonus for 7-day streak
      if (reward.streak === 7) {
        reward.points += 500;
      }
    } else {
      reward.streak = 0;
    }

    this.rewards.set(driverId, reward);
    return reward;
  }

  /**
   * Check eligible bonuses
   */
  async getEligibleBonuses(driverId: string, orderValue: number, hour: number): Promise<Bonus[]> {
    const eligible: Bonus[] = [];

    for (const bonus of this.bonuses) {
      if (bonus.type === 'peak') {
        if (hour >= 11 && hour < 14) {
          eligible.push(bonus);
        } else if (hour >= 18 && hour < 21) {
          eligible.push(bonus);
        }
      } else if (bonus.type === 'milestone') {
        const reward = await this.getDriverReward(driverId);
        // Would check order count
        eligible.push(bonus);
      }
    }

    return eligible;
  }

  /**
   * Get available badges
   */
  async getAvailableBadges(): Promise<Badge[]> {
    return [
      { id: 'first_delivery', name: 'First Delivery', description: 'Complete your first delivery', icon: '🎯', type: 'milestone', requirement: '1 order' },
      { id: 'streak_7', name: 'Week Warrior', description: 'Deliver for 7 days in a row', icon: '🔥', type: 'streak', requirement: '7 day streak' },
      { id: 'streak_30', name: 'Month Master', description: 'Deliver for 30 days in a row', icon: '⚡', type: 'streak', requirement: '30 day streak' },
      { id: 'top_10', name: 'Top 10', description: 'Reach top 10 on leaderboard', icon: '🏆', type: 'achievement', requirement: 'Top 10' },
      { id: 'safety', name: 'Safe Driver', description: 'Complete 100 deliveries safely', icon: '🛡️', type: 'achievement', requirement: '100 orders' },
      { id: 'referrer', name: 'Recruiter', description: 'Refer 3 new drivers', icon: '👥', type: 'special', requirement: '3 referrals' },
    ];
  }

  /**
   * Calculate level progress
   */
  async getLevelProgress(driverId: string): Promise<{ current: number; next: number; progress: number }> {
    const reward = await this.getDriverReward(driverId);
    const currentLevelPoints = (reward.level - 1) * 1000;
    const nextLevelPoints = reward.level * 1000;
    const progress = ((reward.points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;

    return {
      current: reward.level,
      next: reward.level + 1,
      progress,
    };
  }

  /**
   * Get driver statistics
   */
  async getDriverStats(driverId: string): Promise<{
    level: number;
    points: number;
    streak: number;
    badges: Badge[];
    totalEarned: number;
  }> {
    const reward = await this.getDriverReward(driverId);
    
    return {
      level: reward.level,
      points: reward.points,
      streak: reward.streak,
      badges: reward.badges,
      totalEarned: reward.totalEarnings,
    };
  }
}