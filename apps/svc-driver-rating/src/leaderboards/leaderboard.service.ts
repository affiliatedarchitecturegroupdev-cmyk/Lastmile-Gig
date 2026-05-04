import { Injectable } from '@nestjs/common';

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly';
export type LeaderboardType = 'deliveries' | 'rating' | 'earnings' | 'points';

export interface LeaderboardEntry {
  rank: number;
  driverId: string;
  driverName: string;
  photoUrl?: string;
  value: number;
  change: number; // rank change from previous period
}

export interface Leaderboard {
  type: LeaderboardType;
  period: LeaderboardPeriod;
  entries: LeaderboardEntry[];
  lastUpdated: Date;
}

@Injectable()
export class LeaderboardService {
  private leaderboards: Map<string, Leaderboard> = new Map();

  /**
   * Get leaderboard by type and period
   */
  async getLeaderboard(
    type: LeaderboardType,
    period: LeaderboardPeriod = 'weekly'
  ): Promise<Leaderboard> {
    const key = `${type}_${period}`;
    return this.leaderboards.get(key) || this.generateMockLeaderboard(type, period);
  }

  /**
   * Generate leaderboard entries
   */
  private generateMockLeaderboard(type: LeaderboardType, period: LeaderboardPeriod): Leaderboard {
    const baseEntries = [
      { driverId: 'D001', driverName: 'Thabo M.', value: type === 'rating' ? 4.9 : 485, photoUrl: undefined },
      { driverId: 'D002', driverName: 'Sarah K.', value: type === 'rating' ? 4.9 : 452, photoUrl: undefined },
      { driverId: 'D003', driverName: 'Mike T.', value: type === 'rating' ? 4.8 : 420, photoUrl: undefined },
      { driverId: 'D004', driverName: 'David L.', value: type === 'rating' ? 4.8 : 398, photoUrl: undefined },
      { driverId: 'D005', driverName: 'Ali R.', value: type === 'rating' ? 4.7 : 385, photoUrl: undefined },
      { driverId: 'D006', driverName: 'Peter N.', value: type === 'rating' ? 4.7 : 372, photoUrl: undefined },
      { driverId: 'D007', driverName: 'James W.', value: type === 'rating' ? 4.7 : 365, photoUrl: undefined },
      { driverId: 'D008', driverName: 'Chen L.', value: type === 'rating' ? 4.6 : 350, photoUrl: undefined },
      { driverId: 'D009', driverName: 'Kevin M.', value: type === 'rating' ? 4.6 : 342, photoUrl: undefined },
      { driverId: 'D010', driverName: 'Luis G.', value: type === 'rating' ? 4.6 : 328, photoUrl: undefined },
    ];

    const entries: LeaderboardEntry[] = baseEntries.map((e, i) => ({
      rank: i + 1,
      ...e,
      change: Math.floor(Math.random() * 3) - 1, // -1, 0, or 1
    }));

    return {
      type,
      period,
      entries,
      lastUpdated: new Date(),
    };
  }

  /**
   * Get driver's rank on leaderboard
   */
  async getDriverRank(driverId: string, type: LeaderboardType): Promise<number> {
    const leaderboard = await this.getLeaderboard(type);
    const entry = leaderboard.entries.find(e => e.driverId === driverId);
    return entry?.rank || 0;
  }

  /**
   * Get driver's position change
   */
  async getRankChange(driverId: string, type: LeaderboardType): Promise<number> {
    const leaderboard = await this.getLeaderboard(type);
    const entry = leaderboard.entries.find(e => e.driverId === driverId);
    return entry?.change || 0;
  }

  /**
   * Get top N drivers
   */
  async getTopDrivers(limit: number = 10): Promise<LeaderboardEntry[]> {
    const leaderboard = await this.getLeaderboard('deliveries');
    return leaderboard.entries.slice(0, limit);
  }

  /**
   * Check if driver qualifies for badge
   */
  async checkBadges(driverId: string): Promise<Badge[]> {
    const scorecard = await this.ratingService?.getScorecard(driverId);
    const badges: Badge[] = [];

    if (scorecard) {
      if (scorecard.overallRating >= 4.8) badges.push({ id: 'top_rated', name: 'Top Rated', icon: '⭐' });
      if (scorecard.fiveStarPercent >= 90) badges.push({ id: 'five_star', name: 'Five Star', icon: '🌟' });
      if (scorecard.totalRatings >= 500) badges.push({ id: 'pro', name: 'Pro Driver', icon: '🏆' });
    }

    return badges;
  }
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
}

// Import rating service
import { DriverRatingService } from './rating.service';
const ratingService = new DriverRatingService();