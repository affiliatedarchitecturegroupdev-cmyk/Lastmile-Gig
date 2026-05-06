import { Injectable } from '@nestjs/common';

@Injectable()
export class LoyaltyPointsService {
  async awardPoints(userId: string, points: number): Promise<boolean> { return true; }
}