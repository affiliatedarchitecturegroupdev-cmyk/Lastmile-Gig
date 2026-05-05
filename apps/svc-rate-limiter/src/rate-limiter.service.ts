import { Injectable } from '@nestjs/common';

@Injectable()
export class RateLimiterService {
  async checkLimit(key: string, limit: number, windowSeconds: number): Promise<{ allowed: boolean; remaining: number }> { return { allowed: true, remaining: limit - 1 }; }
  async increment(key: string): Promise<number> { return 1; }
  async reset(key: string): Promise<boolean> { return true; }
  async getStatus(key: string): Promise<{ count: number; resetAt: Date }> { return { count: 5, resetAt: new Date() }; }
}