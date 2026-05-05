import { Injectable } from '@nestjs/common';

export interface EarningBreakdown { orderId: string; amount: number; tip: number; bonus: number; distance: number; duration: number }

@Injectable()
export class DriverEarningsService {
  async getEarnings(driverId: string, period: string): Promise<{ total: number; orders: number; tips: number; bonuses: number; avgPerOrder: number }> {
    const orders = Math.floor(Math.random() * 100) + 20;
    return { total: orders * 85, orders, tips: orders * 15, bonuses: 200, avgPerOrder: 85 };
  }
  async getBreakdown(driverId: string): Promise<EarningBreakdown[]> {
    return [{ orderId: 'o1', amount: 65, tip: 15, bonus: 0, distance: 5.2, duration: 22 }];
  }
  async getWeeklyTarget(driverId: string): Promise<{ current: number; target: number; bonus: number }> {
    return { current: 4500, target: 5000, bonus: 500 };
  }
  async getProjectedMonthly(driverId: string): Promise<number> { return 18000; }
  async getPayoutSchedule(driverId: string): Promise<{ nextPayout: Date; amount: number }> {
    const next = new Date(); next.setDate(next.getDate() + 7);
    return { nextPayout: next, amount: 3500 };
  }
}