import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  transactions: WalletTransaction[];
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  createdAt: Date;
}

@Injectable()
export class WalletManagerService {
  private readonly logger = new Logger(WalletManagerService.name);
  private wallets: Map<string, Wallet> = new Map();

  async createWallet(userId: string, currency?: string): Promise<Wallet> {
    const wallet: Wallet = { id: uuidv4(), userId, balance: 0, currency: currency || 'ZAR', transactions: [] };
    this.wallets.set(wallet.id, wallet);
    return wallet;
  }

  async getWallet(userId: string): Promise<Wallet | null> {
    return Array.from(this.wallets.values()).find(w => w.userId === userId) || null;
  }

  async creditWallet(walletId: string, amount: number, description: string): Promise<WalletTransaction> {
    const wallet = this.wallets.get(walletId);
    if (!wallet) throw new Error('Wallet not found');
    const tx: WalletTransaction = { id: uuidv4(), type: 'credit', amount, description, createdAt: new Date() };
    wallet.balance += amount;
    wallet.transactions.push(tx);
    return tx;
  }

  async debitWallet(walletId: string, amount: number, description: string): Promise<WalletTransaction> {
    const wallet = this.wallets.get(walletId);
    if (!wallet || wallet.balance < amount) throw new Error('Insufficient balance');
    const tx: WalletTransaction = { id: uuidv4(), type: 'debit', amount, description, createdAt: new Date() };
    wallet.balance -= amount;
    wallet.transactions.push(tx);
    return tx;
  }

  async getTransactions(walletId: string): Promise<WalletTransaction[]> { return this.wallets.get(walletId)?.transactions || []; }
}