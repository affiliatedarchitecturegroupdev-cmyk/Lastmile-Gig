import { Injectable } from '@nestjs/common';

export interface DriverScore {
  driverId: string;
  score: number;
  distance: number;
  availability: number;
}

@Injectable()
export class MatchingService {
  async findBestDriver(orderId: string, availableDrivers: any[]): Promise<DriverScore[]> {
    const scored = availableDrivers.map(driver => ({
      driverId: driver.id,
      score: this.calculateScore(driver),
      distance: driver.distance || 0,
      availability: driver.currentOrders || 0,
    }));
    return scored.sort((a, b) => b.score - a.score);
  }

  private calculateScore(driver: any): number {
    const distanceScore = Math.max(0, 100 - (driver.distance || 0) * 10);
    const availabilityScore = Math.max(0, 50 - (driver.currentOrders || 0) * 10);
    const ratingScore = (driver.rating || 4.5) * 20;
    return distanceScore + availabilityScore + ratingScore;
  }

  async matchByZone(orderId: string, zoneId: string): Promise<string | null> {
    return null;
  }
}