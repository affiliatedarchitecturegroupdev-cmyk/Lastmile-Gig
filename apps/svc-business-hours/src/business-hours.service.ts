import { Injectable } from '@nestjs/common';

@Injectable()
export class BusinessHoursService {
  async getHours(restaurantId: string): Promise<any> { return { Monday: { open: '09:00', close: '22:00' } }; }
}