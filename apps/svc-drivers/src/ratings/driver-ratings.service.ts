import { Injectable } from '@nestjs/common';

export interface DriverRating {
  id: string;
  orderId: string;
  driverId: string;
  customerId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
}

@Injectable()
export class DriverRatingsService {
  private ratings: Map<string, DriverRating[]> = new Map();

  async rate(orderId: string, driverId: string, customerId: string, rating: number, comment?: string): Promise<DriverRating> {
    const r: DriverRating = {
      id: crypto.randomUUID(),
      orderId,
      driverId,
      customerId,
      rating,
      comment: comment || null,
      createdAt: new Date(),
    };

    const driverRatings = this.ratings.get(driverId) || [];
    driverRatings.push(r);
    this.ratings.set(driverId, driverRatings);

    // Update driver average rating
    await this.updateDriverRating(driverId);

    return r;
  }

  async getRatings(driverId: string, limit = 50): Promise<DriverRating[]> {
    return (this.ratings.get(driverId) || []).slice(-limit);
  }

  async getAverageRating(driverId: string): Promise<{ average: number; total: number }> {
    const ratings = this.ratings.get(driverId) || [];
    if (ratings.length === 0) {
      return { average: 5.0, total: 0 };
    }
    
    const sum = ratings.reduce((s, r) => s + r.rating, 0);
    return {
      average: Math.round((sum / ratings.length) * 100) / 100,
      total: ratings.length,
    };
  }

  async getRatingBreakdown(driverId: string): Promise<Record<number, number>> {
    const ratings = this.ratings.get(driverId) || [];
    const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    for (const r of ratings) {
      breakdown[r.rating]++;
    }
    
    return breakdown;
  }

  private async updateDriverRating(driverId: string): Promise<void> {
    const { average, total } = await this.getAverageRating(driverId);
    // In production, update driver entity in database
    console.log(`Driver ${driverId}: avg ${average}, total ${total}`);
  }

  async getRecentReviews(driverId: string, limit = 10): Promise<DriverRating[]> {
    return (this.ratings.get(driverId) || []).slice(-limit).reverse();
  }
}