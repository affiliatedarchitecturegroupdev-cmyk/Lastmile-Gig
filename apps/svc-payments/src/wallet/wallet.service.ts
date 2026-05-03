import { Injectable } from '@nestjs/common';

export interface Wallet {
  userId: string;
  balance: number;
  pendingBalance: number;
  currency: string;
}

@Injectable()
export class WalletService {
  private wallets: Map<string, Wallet> = new Map();

  async getWallet(userId: string): Promise<Wallet> {
    let wallet = this.wallets.get(userId);
    if (!wallet) {
      wallet = { userId, balance: 0, pendingBalance: 0, currency: 'usd' };
      this.wallets.set(userId, wallet);
    }
    return wallet;
  }

  async addFunds(userId: string, amount: number): Promise<Wallet> {
    const wallet = await this.getWallet(userId);
    wallet.balance += amount;
    return wallet;
  }

  async deductFunds(userId: string, amount: number): Promise<Wallet> {
    const wallet = await this.getWallet(userId);
    if (wallet.balance < amount) throw new Error('Insufficient funds');
    wallet.balance -= amount;
    return wallet;
  }

  async migrateToPending(userId: string, amount: number): Promise<void> {
    const wallet = await this.getWallet(userId);
    wallet.balance -= amount;
    wallet.pendingBalance += amount;
  }

  async releasePending(userId: string, amount: number): Promise<void> {
    const wallet = await this.getWallet(userId);
    wallet.pendingBalance -= amount;
  }
}