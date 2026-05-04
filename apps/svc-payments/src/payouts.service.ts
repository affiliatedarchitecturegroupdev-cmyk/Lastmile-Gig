import { Injectable } from '@nestjs/common';

export interface Payout {
  id: string;
  recipientId: string;
  recipientType: 'driver' | 'partner';
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  bankAccount: string;
  bankCode: string;
  createdAt: Date;
  processedAt?: Date;
}

@Injectable()
export class PayoutsService {
  private payouts: Map<string, Payout[]> = new Map();

  async requestPayout(recipientId: string, recipientType: 'driver' | 'partner', amount: number, bankAccount: string, bankCode: string): Promise<Payout> {
    const payout: Payout = {
      id: crypto.randomUUID(),
      recipientId,
      recipientType,
      amount,
      status: 'pending',
      bankAccount,
      bankCode,
      createdAt: new Date(),
    };

    const recipientPayouts = this.payouts.get(recipientId) || [];
    recipientPayouts.push(payout);
    this.payouts.set(recipientId, recipientPayouts);

    // Auto-process (simulate)
    payout.status = 'completed';
    payout.processedAt = new Date();

    return payout;
  }

  async getPayouts(recipientId: string): Promise<Payout[]> {
    return this.payouts.get(recipientId) || [];
  }

  async getPayout(id: string): Promise<Payout | null> {
    for (const payouts of this.payouts.values()) {
      const payout = payouts.find(p => p.id === id);
      if (payout) return payout;
    }
    return null;
  }

  async cancelPayout(id: string): Promise<void> {
    for (const payouts of this.payouts.values()) {
      const payout = payouts.find(p => p.id === id);
      if (payout && payout.status === 'pending') {
        payout.status = 'failed';
        return;
      }
    }
  }

  async calculatePending(recipientId: string): Promise<number> {
    const payouts = this.payouts.get(recipientId) || [];
    return payouts.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
  }

  async scheduleAutomaticPayouts(): Promise<void> {
    // Auto-payout schedule - runs daily
    console.log('Running automatic payout schedule');
  }
}