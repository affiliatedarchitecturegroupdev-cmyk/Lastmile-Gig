import { Injectable } from '@nestjs/common';

export interface PayoutRequest {
  id: string;
  driverId: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  bankAccount: string;
  createdAt: Date;
  processedAt: Date | null;
}

@Injectable()
export class DriverEarningsService {
  private earnings: Map<string, number[]> = new Map();
  private payouts: Map<string, PayoutRequest[]> = new Map();

  async credit(driverId: string, amount: number, orderId: string): Promise<void> {
    const driverEarnings = this.earnings.get(driverId) || [];
    driverEarnings.push(amount);
    this.earnings.set(driverId, driverEarnings);
  }

  async getBalance(driverId: string): Promise<number> {
    const earnings = this.earnings.get(driverId) || [];
    return earnings.reduce((sum, e) => sum + e, 0);
  }

  async getEarningsHistory(driverId: string, days = 30): Promise<{ date: string; amount: number }[]> {
    // Simplified - return last N transactions
    const earnings = this.earnings.get(driverId) || [];
    return earnings.slice(0, days).map((e, i) => ({
      date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
      amount: e,
    }));
  }

  async requestPayout(driverId: string, amount: number, bankAccount: string): Promise<PayoutRequest> {
    const payout: PayoutRequest = {
      id: crypto.randomUUID(),
      driverId,
      amount,
      status: 'pending',
      bankAccount,
      createdAt: new Date(),
      processedAt: null,
    };

    const driverPayouts = this.payouts.get(driverId) || [];
    driverPayouts.push(payout);
    this.payouts.set(driverId, driverPayouts);

    return payout;
  }

  async getPayouts(driverId: string): Promise<PayoutRequest[]> {
    return this.payouts.get(driverId) || [];
  }

  async calculateDriverEarnings(orderId: string, baseAmount: number, distanceKm: number): Promise<number> {
    // Calculate driver earnings based on order value and distance
    const pickupFee = 20;
    const perKmFee = 5;
    const percentageCut = 0.80; // Driver gets 80%
    
    const distancePay = distanceKm * perKmFee;
    const gross = pickupFee + distancePay + (baseAmount * percentageCut);
    
    return Math.round(gross * 100) / 100;
  }

  async getDailyEarnings(driverId: string, date: Date): Promise<{ orders: number; total: number }> {
    // Return earnings for a specific day
    const earnings = this.earnings.get(driverId) || [];
    return { orders: earnings.length, total: earnings.reduce((s, e) => s + e, 0) };
  }

  async getWeeklyEarnings(driverId: string): Promise<{ daily: { date: string; amount: number }[]; total: number }> {
    const daily = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(Date.now() - i * 86400000);
      daily.push({
        date: date.toISOString().split('T')[0],
        amount: 0,
      });
    }
    return { daily, total: 0 };
  }
}