import { Injectable } from '@nestjs/common';

@Injectable()
export class ClosedDayService {
  async setClosed(restaurantId: string, date: string): Promise<boolean> { return true; }
}