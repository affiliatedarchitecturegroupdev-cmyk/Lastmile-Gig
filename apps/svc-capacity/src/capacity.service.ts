import { Injectable } from '@nestjs/common';

@Injectable()
export class CapacityService {
  async getCapacity(restaurantId: string, date: string): Promise<{ current: number; max: number }> { return { current: 12, max: 20 }; }
}