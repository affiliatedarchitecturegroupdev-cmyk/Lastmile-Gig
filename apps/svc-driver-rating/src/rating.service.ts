import { Injectable } from '@nestjs/common';

export type RatingCategory = 'professionalism' | 'timeliness' | 'accuracy' | 'communication' | 'condition';

export interface DriverRating {
  id: string;
  orderId: string;
  driverId: string;
  customerId: string;
  overall: number;
  categories: { category: RatingCategory; score: number; comment?: string }[];
  tipAmount?: number;
  createdAt: Date;
}

export interface DriverScorecard {
  driverId: string;
  overallRating: number;
  professionalism: number;
  timeliness: number;
  accuracy: number;
  communication: number;
  condition: number;
  totalRatings: number;
  fiveStarPercent: number;
  onTimePercent: number;
}

export interface RatingSummary {
  period: string;
  avgRating: number;
  totalRatings: number;
  scorecard: DriverScorecard;
  trend: number; // positive or negative
}

@Injectable()
export class DriverRatingService {
  private ratings: Map<string, DriverRating[]> = new Map();
  private scorecards: Map<string, DriverScorecard> = new Map();

  /**
   * Submit rating for completed delivery
   */
  async submitRating(data: {
    orderId: string;
    driverId: string;
    customerId: string;
    overall: number;
    categories: { category: RatingCategory; score: number; comment?: string }[];
    tipAmount?: number;
  }): Promise<DriverRating> {
    const rating: DriverRating = {
      id: `${data.driverId}_${data.orderId}`,
      ...data,
      createdAt: new Date(),
    };

    // Store rating
    const driverRatings = this.ratings.get(data.driverId) || [];
    driverRatings.push(rating);
    this.ratings.set(data.driverId, driverRatings);

    // Recalculate scorecard
    await this.updateScorecard(data.driverId);

    return rating;
  }

  /**
   * Calculate driver scorecard
   */
  private async updateScorecard(driverId: string): Promise<DriverScorecard> {
    const ratings = this.ratings.get(driverId) || [];
    
    if (ratings.length === 0) {
      return this.getDefaultScorecard(driverId);
    }

    const getAvg = (category?: RatingCategory) => {
      const relevant = category
        ? ratings.flatMap(r => r.categories.filter(c => c.category === category))
        : ratings;
      if (relevant.length === 0) return 0;
      return relevant.reduce((sum, r) => sum + r.score, 0) / relevant.length;
    };

    const fiveStarCount = ratings.filter(r => r.overall >= 5).length;
    const onTimeCount = ratings.flatMap(r => r.categories)
      .filter(c => c.category === 'timeliness' && c.score >= 4).length;

    const scorecard: DriverScorecard = {
      driverId,
      overallRating: getAvg(),
      professionalism: getAvg('professionalism'),
      timeliness: getAvg('timeliness'),
      accuracy: getAvg('accuracy'),
      communication: getAvg('communication'),
      condition: getAvg('condition'),
      totalRatings: ratings.length,
      fiveStarPercent: (fiveStarCount / ratings.length) * 100,
      onTimePercent: ratings.length > 0 ? (onTimeCount / ratings.length) * 100 : 0,
    };

    this.scorecards.set(driverId, scorecard);
    return scorecard;
  }

  private getDefaultScorecard(driverId: string): DriverScorecard {
    return {
      driverId,
      overallRating: 0,
      professionalism: 0,
      timeliness: 0,
      accuracy: 0,
      communication: 0,
      condition: 0,
      totalRatings: 0,
      fiveStarPercent: 0,
      onTimePercent: 0,
    };
  }

  /**
   * Get driver scorecard
   */
  async getScorecard(driverId: string): Promise<DriverScorecard> {
    return this.scorecards.get(driverId) || this.getDefaultScorecard(driverId);
  }

  /**
   * Get rating summary for period
   */
  async getSummary(driverId: string, days: number = 30): Promise<RatingSummary> {
    const scorecard = await this.getScorecard(driverId);
    const ratings = this.ratings.get(driverId) || [];
    
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - days);
    
    const periodRatings = ratings.filter(r => r.createdAt >= periodStart);
    const avgRating = periodRatings.length > 0
      ? periodRatings.reduce((sum, r) => sum + r.overall, 0) / periodRatings.length
      : 0;

    return {
      period: `Last ${days} days`,
      avgRating,
      totalRatings: periodRatings.length,
      scorecard,
      trend: 0.1, // Would calculate from history
    };
  }

  /**
   * Get driver's recent ratings
   */
  async getRecentRatings(driverId: string, limit: number = 10): Promise<DriverRating[]> {
    const ratings = this.ratings.get(driverId) || [];
    return ratings.slice(-limit).reverse();
  }

  /**
   * Bulk calculate ratings for analytics
   */
  async calculatePlatformRatings(): Promise<{
    avgOverall: number;
    avgProfessionalism: number;
    avgTimeliness: number;
    totalRatings: number;
  }> {
    let totalOverall = 0;
    let totalProfessionalism = 0;
    let totalTimeliness = 0;
    let count = 0;

    for (const ratings of this.ratings.values()) {
      for (const r of ratings) {
        totalOverall += r.overall;
        totalProfessionalism += r.categories.find(c => c.category === 'professionalism')?.score || r.overall;
        totalTimeliness += r.categories.find(c => c.category === 'timeliness')?.score || r.overall;
        count++;
      }
    }

    return {
      avgOverall: count > 0 ? totalOverall / count : 0,
      avgProfessionalism: count > 0 ? totalProfessionalism / count : 0,
      avgTimeliness: count > 0 ? totalTimeliness / count : 0,
      totalRatings: count,
    };
  }
}