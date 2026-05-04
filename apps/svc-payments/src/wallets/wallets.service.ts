import { Injectable } from '@nestjs/common';

export interface Wallet {
  userId: string;
  balance: number;
  pendingBalance: number;
  currency: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  reference: string;
  createdAt: Date;
}

@Injectable()
export class WalletsService {
  private wallets: Map<string, Wallet> = new Map();
  private transactions: Map<string, WalletTransaction[]> = new Map();

  async getOrCreateWallet(userId: string): Promise<Wallet> {
    let wallet = this.wallets.get(userId);
    if (!wallet) {
      wallet = {
        userId,
        balance: 0,
        pendingBalance: 0,
        currency: 'ZAR',
      };
      this.wallets.set(userId, wallet);
    }
    return wallet;
  }

  async credit(userId: string, amount: number, description: string, reference: string): Promise<WalletTransaction> {
    const wallet = await this.getOrCreateWallet(userId);
    wallet.balance += amount;

    const transaction: WalletTransaction = {
      id: crypto.randomUUID(),
      walletId: userId,
      type: 'credit',
      amount,
      description,
      reference,
      createdAt: new Date(),
    };

    const walletTransactions = this.transactions.get(userId) || [];
    walletTransactions.push(transaction);
    this.transactions.set(userId, walletTransactions);

    return transaction;
  }

  async debit(userId: string, amount: number, description: string, reference: string): Promise<WalletTransaction> {
    const wallet = await this.getOrCreateWallet(userId);
    
    if (wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }
    
    wallet.balance -= amount;

    const transaction: WalletTransaction = {
      id: crypto.randomUUID(),
      walletId: userId,
      type: 'debit',
      amount: -amount,
      description,
      reference,
      createdAt: new Date(),
    };

    const walletTransactions = this.transactions.get(userId) || [];
    walletTransactions.push(transaction);
    this.transactions.set(userId, walletTransactions);

    return transaction;
  }

  async getTransactions(userId: string, limit = 50): Promise<WalletTransaction[]> {
    return (this.transactions.get(userId) || []).slice(-limit);
  }

  async getBalance(userId: string): Promise<number> {
    const wallet = await this.getOrCreateWallet(userId);
    return wallet.balance;
  }

  async addFunds(userId: string, amount: number): Promise<Wallet> {
    const wallet = await this.getOrCreateWallet(userId);
    wallet.balance += amount;
    return wallet;
  }
}