import { Injectable } from '@nestjs/common';

export interface Price surge { factor: number; reason: string; validUntil: Date }

@Injectable()
export class DynamicPricingService {
  private surges: Map<string, Price surge[]> = new Map();

  async checkSurge(zoneId: string, time: Date): Promise<{ surge: boolean; factor: number; reason: string }> {
    const hour = time.getHours();
    if (hour >= 12 && hour < 14 || hour >= 18 && hour < 21) {
      return { surge: true, factor: 1.5, reason: 'Peak hours' };
    }
    return { surge: false, factor: 1.0, reason: '' };
  }

  async setSurge(zoneId: string, surge: Price surge): Promise<boolean> {
    const existing = this.surges.get(zoneId) || [];
    existing.push(surge);
    this.surges.set(zoneId, existing);
    return true;
  }

  async clearSurges(zoneId: string): Promise<boolean> {
    this.surges.set(zoneId, []);
    return true;
  }

  async getPriceHistory(zoneId: string): Promise<{ time: Date; factor: number }[]> {
    const hours: { time: Date; factor: number }[] = [];
    for (let i = 0; i < 24; i++) {
      const time = new Date();
      time.setHours(i, 0, 0, 0);
      const factor = (i >= 12 && i < 14 || i >= 18 && i < 21) ? 1.5 : 1.0;
      hours.push({ time, factor });
    }
    return hours;
  }

  async getFairPriceRating(zoneId: string): Promise<{ score: number; label: string }> {
    return { score: 85, label: 'Good value' };
  }

  async comparePrices(zoneId: string): Promise<{ ours: number; average: number; savings: number }> {
    return { ours: 35, average: 42, savings: 7 };
  }
}