import { Injectable } from '@nestjs/common';

@Injectable()
export class DriverMatchService {
  async matchDriver(orderId: string, driverIds: string[]): Promise<{ driverId: string; score: number; reason: string }> {
    return { driverId: driverIds[0], score: 0.92, reason: 'Nearest, highest rated' };
  }

  async updateMatchParams(orderId: string, params: { urgency: number; preferences: string[] }): Promise<boolean> { return true; }
  async getMatchHistory(driverId: string): Promise<{ orderId: string; matchedAt: Date; accepted: boolean }[]> { return []; }
}