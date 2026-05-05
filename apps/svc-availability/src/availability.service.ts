import { Injectable } from '@nestjs/common';

@Injectable()
export class AvailabilityService {
  async check(itemId: string): Promise<boolean> { return true; }
}