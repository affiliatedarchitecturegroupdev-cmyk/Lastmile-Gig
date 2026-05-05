import { Injectable } from '@nestjs/common';

export interface Tip { orderId: string; driverId: string; amount: number; rating: number; message?: string }

@Injectable()
export class TipsService {
  async addTip(data: { orderId: string; driverId: string; amount: number; message?: string }): Promise<{ success: boolean; tipId: string }> {
    return { success: true, tipId: `tip_${Date.now()}` };
  }
  async getTipForOrder(orderId: string): Promise<Tip | null> { return { orderId, driverId: 'd1', amount: 20, rating: 5 }; }
  async getDriverTips(driverId: string): Promise<{ total: number; avgTip: number; ordersWithTips: number }> {
    return { total: 4500, avgTip: 18.5, ordersWithTips: 245 };
  }
  async suggestTip(orderTotal: number): Promise<{ percentage: number; suggested: number }[]> {
    return [
      { percentage: 10, suggested: Math.round(orderTotal * 0.1) },
      { percentage: 15, suggested: Math.round(orderTotal * 0.15) },
      { percentage: 20, suggested: Math.round(orderTotal * 0.2) },
    ];
  }
  async getTippingLeaderboard(): Promise<{ driverId: string; totalTips: number }[]> {
    return [{ driverId: 'd1', totalTips: 8500 }, { driverId: 'd2', totalTips: 7200 }];
  }
}