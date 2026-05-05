import { Injectable } from '@nestjs/common';

export interface Payout {
  id: string;
  partnerId: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  bankAccount: string;
  createdAt: Date;
  processedAt?: Date;
}

export interface PayoutSchedule {
  partnerId: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  threshold: number;
  bankDetails: {
    bank: string;
    accountNumber: string;
    accountType: 'cheque' | 'savings';
  };
}

@Injectable()
export class PayoutService {
  private schedules: Map<string, PayoutSchedule> = new Map();

  /**
   * Request payout
   */
  async requestPayout(partnerId: string, amount: number): Promise<Payout> {
    return {
      id: `payout_${Date.now()}`,
      partnerId,
      amount,
      status: 'pending',
      bankAccount: '****1234',
      createdAt: new Date(),
    };
  }

  /**
   * Set payout schedule
   */
  async setPayoutSchedule(schedule: PayoutSchedule): Promise<void> {
    this.schedules.set(schedule.partnerId, schedule);
  }

  /**
   * Get balance
   */
  async getBalance(partnerId: string): Promise<{
    available: number;
    pending: number;
    total: number;
  }> {
    return {
      available: Math.floor(Math.random() * 5000) + 1000,
      pending: Math.floor(Math.random() * 2000) + 500,
      total: Math.floor(Math.random() * 7000) + 1500,
    };
  }

  /**
   * Get payout history
   */
  async getPayoutHistory(partnerId: string): Promise<Payout[]> {
    return [
      { id: 'p1', partnerId, amount: 2500, status: 'completed', bankAccount: '****1234', createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), processedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { id: 'p2', partnerId, amount: 3200, status: 'completed', bankAccount: '****1234', createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), processedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000) },
    ];
  }

  /**
   * Get pending payouts
   */
  async getPendingPayouts(partnerId: string): Promise<number> {
    return Math.floor(Math.random() * 2000) + 500;
  }

  /**
   * Get summary
   */
  async getSummary(partnerId: string): Promise<{
    totalEarned: number;
    totalPaid: number;
    pendingAmount: number;
    lastPayout: Date;
  }> {
    return {
      totalEarned: 45000,
      totalPaid: 38000,
      pendingAmount: 7000,
      lastPayout: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    };
  }

  /**
   * Get payout schedule
   */
  async getPayoutSchedule(partnerId: string): Promise<PayoutSchedule | null> {
    return this.schedules.get(partnerId) || {
      partnerId,
      frequency: 'weekly',
      threshold: 500,
      bankDetails: {
        bank: 'First National Bank',
        accountNumber: '****1234',
        accountType: 'cheque',
      },
    };
  }
}