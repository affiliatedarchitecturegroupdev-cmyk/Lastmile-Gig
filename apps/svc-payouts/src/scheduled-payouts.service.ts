import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export type PayoutFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type PayoutType = 'driver' | 'partner';

export interface PayoutSchedule {
  id: string;
  entityId: string;
  type: PayoutType;
  frequency: PayoutFrequency;
  threshold: number;
  bankAccountId: string;
  autoProcess: boolean;
}

export interface Payout {
  id: string;
  entityId: string;
  type: PayoutType;
  amount: number;
  status: PayoutStatus;
  processedAt?: Date;
  bankReference?: string;
  failures?: string[];
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: 'cheque' | 'savings';
  branchCode: string;
  verified: boolean;
}

export interface TaxDocument {
  id: string;
  entityId: string;
  year: number;
  type: 'irp5' | 'tax_certificate';
  amount: number;
  issuedAt: Date;
}

@Injectable()
export class ScheduledPayoutsService {
  private schedules: Map<string, PayoutSchedule> = new Map();
  private payouts: Map<string, Payout[]> = new Map();
  private bankAccounts: Map<string, BankAccount> = new Map();

  /**
   * Create payout schedule
   */
  async createSchedule(data: {
    entityId: string;
    type: PayoutType;
    frequency: PayoutFrequency;
    threshold?: number;
    bankAccountId: string;
    autoProcess?: boolean;
  }): Promise<PayoutSchedule> {
    const schedule: PayoutSchedule = {
      id: uuidv4(),
      entityId: data.entityId,
      type: data.type,
      frequency: data.frequency,
      threshold: data.threshold || 500,
      bankAccountId: data.bankAccountId,
      autoProcess: data.autoProcess || true,
    };

    this.schedules.set(schedule.id, schedule);
    return schedule;
  }

  /**
   * Get entity schedule
   */
  async getSchedule(entityId: string): Promise<PayoutSchedule | null> {
    for (const schedule of this.schedules.values()) {
      if (schedule.entityId === entityId) {
        return schedule;
      }
    }
    return null;
  }

  /**
   * Process payout
   */
  async processPayout(entityId: string, amount?: number): Promise<Payout> {
    const schedule = await this.getSchedule(entityId);
    const bank = this.bankAccounts.get(schedule?.bankAccountId || '');

    const payoutAmount = amount || schedule?.threshold || 500;

    const payout: Payout = {
      id: uuidv4(),
      entityId,
      type: schedule?.type || 'driver',
      amount: payoutAmount,
      status: 'processing',
    };

    // Simulate processing
    setTimeout(() => {
      payout.status = 'completed';
      payout.processedAt = new Date();
      payout.bankReference = `TXN${Date.now()}`;
    }, 1000);

    const entityPayouts = this.payouts.get(entityId) || [];
    entityPayouts.push(payout);
    this.payouts.set(entityId, entityPayouts);

    return payout;
  }

  /**
   * Get payout history
   */
  async getPayoutHistory(entityId: string, limit?: number): Promise<Payout[]> {
    const payouts = this.payouts.get(entityId) || [];
    return limit ? payouts.slice(-limit) : payouts;
  }

  /**
   * Add bank account
   */
  async addBankAccount(data: {
    entityId: string;
    bankName: string;
    accountNumber: string;
    accountType: 'cheque' | 'savings';
    branchCode: string;
  }): Promise<BankAccount> {
    const account: BankAccount = {
      id: uuidv4(),
      ...data,
      verified: false,
    };

    this.bankAccounts.set(account.id, account);
    return account;
  }

  /**
   * Verify bank account
   */
  async verifyBankAccount(accountId: string): Promise<boolean> {
    const account = this.bankAccounts.get(accountId);
    if (!account) return false;

    // Simulate verification
    account.verified = true;
    this.bankAccounts.set(accountId, account);
    return true;
  }

  /**
   * Get pending payouts
   */
  async getPendingPayouts(): Promise<{
    totalAmount: number;
    count: number;
    byType: Record<PayoutType, number>;
  }> {
    let totalAmount = 0;
    let count = 0;
    const byType: Record<PayoutType, number> = { driver: 0, partner: 0 };

    for (const payouts of this.payouts.values()) {
      for (const p of payouts) {
        if (p.status === 'pending' || p.status === 'processing') {
          totalAmount += p.amount;
          count++;
          byType[p.type]++;
        }
      }
    }

    return { totalAmount, count, byType };
  }

  /**
   * Get balance
   */
  async getBalance(entityId: string): Promise<{
    available: number;
    pending: number;
    scheduled: number;
  }> {
    return {
      available: Math.floor(Math.random() * 5000) + 1000,
      pending: Math.floor(Math.random() * 2000) + 500,
      scheduled: Math.floor(Math.random() * 1000),
    };
  }

  /**
   * Calculate next payout date
   */
  async getNextPayoutDate(entityId: string): Promise<Date> {
    const schedule = await this.getSchedule(entityId);
    const now = new Date();

    switch (schedule?.frequency) {
      case 'daily':
        now.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        now.setDate(now.getDate() + 7);
        break;
      case 'biweekly':
        now.setDate(now.getDate() + 14);
        break;
      case 'monthly':
        now.setMonth(now.getMonth() + 1);
        break;
      default:
        now.setDate(now.getDate() + 7);
    }

    return now;
  }

  /**
   * Generate tax document
   */
  async generateTaxDocument(entityId: string, year: number): Promise<TaxDocument> {
    return {
      id: uuidv4(),
      entityId,
      year,
      type: 'tax_certificate',
      amount: Math.floor(Math.random() * 50000),
      issuedAt: new Date(),
    };
  }

  /**
   * Get tax documents
   */
  async getTaxDocuments(entityId: string): Promise<TaxDocument[]> {
    return [
      { id: 't1', entityId, year: 2024, type: 'tax_certificate', amount: 45000, issuedAt: new Date('2024-02-28') },
      { id: 't2', entityId, year: 2023, type: 'irp5', amount: 38000, issuedAt: new Date('2023-02-28') },
    ];
  }

  /**
   * Update schedule
   */
  async updateSchedule(entityId: string, updates: Partial<PayoutSchedule>): Promise<boolean> {
    const schedule = await this.getSchedule(entityId);
    if (!schedule) return false;

    const newSchedule = { ...schedule, ...updates };
    this.schedules.set(schedule.id, newSchedule);
    return true;
  }

  /**
   * Cancel payout
   */
  async cancelPayout(payoutId: string): Promise<boolean> {
    for (const payouts of this.payouts.values()) {
      const payout = payouts.find(p => p.id === payoutId);
      if (payout && payout.status !== 'completed') {
        payout.status = 'failed';
        payout.failures = payout.failures || [];
        payout.failures.push('Cancelled by user');
        return true;
      }
    }
    return false;
  }
}