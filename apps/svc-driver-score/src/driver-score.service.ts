import { Injectable } from '@nestjs/common';

@Injectable()
export class DriverScoreService {
  async calculateScore(driverId: string): Promise<{ total: number; breakdown: any }> {
    return { total: 85.5, breakdown: { rating: 40, acceptance: 25, deliveries: 15, feedback: 5.5 } };
  }
}