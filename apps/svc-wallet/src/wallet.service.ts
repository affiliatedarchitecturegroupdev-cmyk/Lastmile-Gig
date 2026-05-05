import { Injectable } from '@nestjs/common';

export interface Transaction { id: string; type: 'credit' | 'debit'; amount: number; description: string; timestamp: Date }

@Injectable()
export class WalletService {
  async getBalance(userId: string): Promise<{ available: number; pending: number; total: number }> {
    return { available: 1250, pending: 350, total: 1600 };
  }
  async addFunds(userId: string, amount: number): Promise<{ success: boolean; transactionId: string }> {
    return { success: true, transactionId: `txn_${Date.now()}` };
  }
  async getTransactions(userId: string): Promise<Transaction[]> {
    return [
      { id: 't1', type: 'debit', amount: 250, description: 'Order #1234', timestamp: new Date() },
    ];
  }
  async transferToBank(userId: string, amount: number): Promise<{ success: boolean }> { return { success: true }; }
  async getWalletStats(userId: string): Promise<{ spent: number; saved: number; cashback: number }> {
    return { spent: 4500, saved: 450, cashback: 225 };
  }
}