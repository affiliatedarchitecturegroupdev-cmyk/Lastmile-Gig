import { Injectable } from '@nestjs/common';

@Injectable()
export class RateLimiterV2Service {
  async checkLimit(key: string): Promise<{ allowed: boolean; remaining: number }> { return { allowed: true, remaining: 100 }; }
}