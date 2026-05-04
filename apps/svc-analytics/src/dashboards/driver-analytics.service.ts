import { Injectable } from '@nestjs/common';

export interface DriverStats {
  driverId: string;
  name: string;
  totalDeliveries: number;
  avgRating: number;
  avgDeliveryTime: number;
  totalEarnings: number;
  acceptanceRate: number;
  onTimeRate: number;
}

export interface DriverLeaderboard {
  rank: number;
  driverId: string;
  name: string;
  deliveries: number;
  rating: number;
  earnings: number;
}

export interface DriverPerformance {
  period: string;
  topPerformers: DriverLeaderboard[];
  avgDeliveryTime: number;
  avgRating: number;
  totalActive: number;
}

@Injectable()
export class DriverAnalyticsService {
  /**
   * Get driver statistics
   */
  async getDriverStats(driverId: string): Promise<DriverStats> {
    return {
      driverId,
      name: 'John D.',
      totalDeliveries: 1245,
      avgRating: 4.8,
      avgDeliveryTime: 26.5,
      totalEarnings: 89500,
      acceptanceRate: 92,
      onTimeRate: 96,
    };
  }

  /**
   * Get driver leaderboard
   */
  async getLeaderboard(limit: number = 20): Promise<DriverLeaderboard[]> {
    return [
      { rank: 1, driverId: 'D001', name: 'Thabo M.', deliveries: 485, rating: 4.9, earnings: 42500 },
      { rank: 2, driverId: 'D002', name: 'Sarah K.', deliveries: 452, rating: 4.9, earnings: 39800 },
      { rank: 3, driverId: 'D003', name: 'Mike T.', deliveries: 420, rating: 4.8, earnings: 37200 },
      { rank: 4, driverId: 'D004', name: 'David L.', deliveries: 398, rating: 4.8, earnings: 35100 },
      { rank: 5, driverId: 'D005', name: 'Ali R.', deliveries: 385, rating: 4.7, earnings: 34000 },
      { rank: 6, driverId: 'D006', name: 'Peter N.', deliveries: 372, rating: 4.7, earnings: 32800 },
      { rank: 7, driverId: 'D007', name: 'James W.', deliveries: 365, rating: 4.7, earnings: 32100 },
      { rank: 8, driverId: 'D008', name: 'Chen L.', deliveries: 350, rating: 4.6, earnings: 30800 },
      { rank: 9, driverId: 'D009', name: 'Kevin M.', deliveries: 342, rating: 4.6, earnings: 29500 },
      { rank: 10, driverId: 'D010', name: 'Luis G.', deliveries: 328, rating: 4.6, earnings: 28800 },
    ];
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(): Promise<DriverPerformance> {
    const leaderboard = await this.getLeaderboard(10);

    return {
      period: 'Last 30 days',
      topPerformers: leaderboard,
      avgDeliveryTime: 28.5,
      avgRating: 4.6,
      totalActive: 342,
    };
  }

  /**
   * Get hourly driver distribution
   */
  async getDriverDistribution(): Promise<{hour: number; online: number; delivering: number}> {
    return [
      { hour: 6, online: 25, delivering: 12 }, { hour: 7, online: 45, delivering: 28 },
      { hour: 8, online: 68, delivering: 42 }, { hour: 9, online: 85, delivering: 55 },
      { hour: 10, online: 92, delivering: 58 }, { hour: 11, online: 98, delivering: 62 },
      { hour: 12, online: 145, delivering: 95 }, { hour: 13, online: 152, delivering: 102 },
      { hour: 14, online: 128, delivering: 85 }, { hour: 15, online: 95, delivering: 62 },
      { hour: 16, online: 88, delivering: 55 }, { hour: 17, online: 125, delivering: 82 },
      { hour: 18, online: 185, delivering: 125 }, { hour: 19, online: 245, delivering: 168 },
      { hour: 20, online: 268, delivering: 185 }, { hour: 21, online: 245, delivering: 162 },
      { hour: 22, online: 195, delivering: 128 }, { hour: 23, online: 95, delivering: 58 },
    ];
  }

  /**
   * Get driver zone coverage
   */
  async getZoneCoverage(): Promise<{zone: string; drivers: number; coverage: number}> {
    return [
      { zone: 'Sandton', drivers: 85, coverage: 98 },
      { zone: 'Rosebank', drivers: 42, coverage: 95 },
      { zone: 'Midrand', drivers: 38, coverage: 88 },
      { zone: 'Centurion', drivers: 35, coverage: 82 },
      { zone: 'Johannesburg CBD', drivers: 65, coverage: 92 },
      { zone: 'Alexandra', drivers: 28, coverage: 75 },
    ];
  }

  /**
   * Calculate driver earnings
   */
  calculateEarnings(deliveries: number, baseRate: number = 35, perKm: number = 5): number {
    return deliveries * baseRate; // Simplified
  }

  /**
   * Get driver retention rate
   */
  async getRetentionRate(): Promise<{month: string; rate: number}> {
    return [
      { month: 'Jan', rate: 92 }, { month: 'Feb', rate: 93 },
      { month: 'Mar', rate: 91 }, { month: 'Apr', rate: 94 },
      { month: 'May', rate: 95 }, { month: 'Jun', rate: 94 },
    ];
  }

  /**
   * Get inactive drivers
   */
  async getInactiveDrivers(days: number = 7): Promise<string[]> {
    // Return driver IDs who haven't delivered in N days
    return ['D011', 'D015', 'D022'];
  }
}