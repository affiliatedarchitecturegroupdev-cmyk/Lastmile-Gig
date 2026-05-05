import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface PaymentTransaction {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  provider: PaymentProvider;
  status: PaymentStatus;
  metadata: Record<string, any>;
  createdAt: Date;
  processedAt?: Date;
  settledAt?: Date;
  failureReason?: string;
}

export type PaymentMethod = 'card' | 'bank' | 'wallet' | 'crypto' | 'usd' | ' installment';
export type PaymentProvider = 'stripe' | 'paystack' | 'flutterwave' | 'crypto' | 'yoco';
export type PaymentStatus = 'pending' | 'processing' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'partially_refunded' | 'disputed';

export interface CardPaymentRequest {
  orderId: string;
  userId: string;
  amount: number;
  currency?: string;
  cardToken: string;
  saveCard?: boolean;
}

export interface BankPaymentRequest {
  orderId: string;
  userId: string;
  amount: number;
  bankAccount: string;
  bankCode: string;
}

export interface Payment3DSecure {
  redirectUrl: string;
  transactionId: string;
}

@Injectable()
export class PaymentGatewayService {
  private readonly logger = new Logger(PaymentGatewayService.name);
  private transactions: Map<string, PaymentTransaction> = new Map();

  async processCardPayment(request: CardPaymentRequest): Promise<PaymentTransaction> {
    const transaction: PaymentTransaction = {
      id: uuidv4(),
      orderId: request.orderId,
      userId: request.userId,
      amount: request.amount,
      currency: request.currency || 'ZAR',
      method: 'card',
      provider: 'stripe',
      status: 'pending',
      metadata: { cardToken: request.cardToken, saveCard: request.saveCard },
      createdAt: new Date(),
    };

    this.transactions.set(transaction.id, transaction);
    this.logger.log(`Card payment ${transaction.id} initiated: R${request.amount}`);

    transaction.status = 'captured';
    transaction.processedAt = new Date();
    this.transactions.set(transaction.id, transaction);

    return transaction;
  }

  async processBankPayment(request: BankPaymentRequest): Promise<PaymentTransaction> {
    const transaction: PaymentTransaction = {
      id: uuidv4(),
      orderId: request.orderId,
      userId: request.userId,
      amount: request.amount,
      currency: 'ZAR',
      method: 'bank',
      provider: 'paystack',
      status: 'pending',
      metadata: { bankAccount: request.bankAccount, bankCode: request.bankCode },
      createdAt: new Date(),
    };

    this.transactions.set(transaction.id, transaction);
    
    transaction.status = 'processing';
    this.transactions.set(transaction.id, transaction);

    return transaction;
  }

  async init3DSecure(transactionId: string): Promise<Payment3DSecure> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) throw new Error('Transaction not found');

    return { redirectUrl: 'https://3ds.provider.com/auth', transactionId };
  }

  async verify3DSecure(transactionId: string, authResult: string): Promise<boolean> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) return false;

    transaction.status = 'captured';
    transaction.processedAt = new Date();
    this.transactions.set(transactionId, transaction);

    return true;
  }

  async capturePayment(transactionId: string, amount?: number): Promise<boolean> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) return false;

    const captureAmount = amount || transaction.amount;
    transaction.status = 'captured';
    transaction.metadata.capturedAmount = captureAmount;
    transaction.processedAt = new Date();
    this.transactions.set(transactionId, transaction);

    this.logger.log(`Payment ${transactionId} captured: R${captureAmount}`);
    return true;
  }

  async refundPayment(transactionId: string, amount?: number, reason?: string): Promise<PaymentTransaction> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) throw new Error('Transaction not found');

    const refundAmount = amount || transaction.amount;
    const refundTx: PaymentTransaction = {
      id: uuidv4(),
      orderId: transaction.orderId,
      userId: transaction.userId,
      amount: refundAmount,
      currency: transaction.currency,
      method: transaction.method,
      provider: transaction.provider,
      status: 'refunded',
      metadata: { originalTransactionId: transactionId, reason },
      createdAt: new Date(),
      processedAt: new Date(),
    };

    transaction.status = refundAmount < transaction.amount ? 'partially_refunded' : 'refunded';
    this.transactions.set(transactionId, transaction);
    this.transactions.set(refundTx.id, refundTx);

    this.logger.log(`Refund ${refundTx.id}: R${refundAmount}`);
    return refundTx;
  }

  async getTransaction(transactionId: string): Promise<PaymentTransaction | null> {
    return this.transactions.get(transactionId) || null;
  }

  async getOrderTransactions(orderId: string): Promise<PaymentTransaction[]> {
    return Array.from(this.transactions.values()).filter(t => t.orderId === orderId);
  }

  async getUserTransactions(userId: string, limit?: number): Promise<PaymentTransaction[]> {
    const transactions = Array.from(this.transactions.values())
      .filter(t => t.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return limit ? transactions.slice(0, limit) : transactions;
  }

  async voidAuthorization(transactionId: string): Promise<boolean> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction || transaction.status !== 'authorized') return false;

    transaction.status = 'failed';
    transaction.failureReason = 'Voided by merchant';
    this.transactions.set(transactionId, transaction);

    return true;
  }

  async processRecurringPayment(userId: string, amount: number): Promise<PaymentTransaction[]> {
    const failedTransactions: PaymentTransaction[] = [];
    this.logger.log(`Processing recurring payments for ${userId}`);

    return failedTransactions;
  }

  async getPaymentMethods(userId: string): Promise<{ method: string; available: boolean }[]> {
    return [
      { method: 'card', available: true },
      { method: 'wallet', available: true },
      { method: 'bank', available: true },
      { method: 'crypto', available: false },
    ];
  }

  async getSettlementReport(startDate: Date, endDate: Date): Promise<{
    totalProcessed: number;
    totalRefunded: number;
    netRevenue: number;
    byProvider: Record<string, number>;
  }> {
    const transactions = Array.from(this.transactions.values()).filter(t => 
      t.createdAt >= startDate && t.createdAt <= endDate
    );

    const totalProcessed = transactions.filter(t => t.status === 'captured').reduce((sum, t) => sum + t.amount, 0);
    const totalRefunded = transactions.filter(t => t.status === 'refunded').reduce((sum, t) => sum + t.amount, 0);
    const byProvider: Record<string, number> = {};

    for (const t of transactions.filter(tx => tx.status === 'captured')) {
      byProvider[t.provider] = (byProvider[t.provider] || 0) + tx.amount;
    }

    return {
      totalProcessed: Math.round(totalProcessed),
      totalRefunded: Math.round(totalRefunded),
      netRevenue: Math.round(totalProcessed - totalRefunded),
      byProvider,
    };
  }

  async processDispute(disputeId: string, evidence: any): Promise<boolean> {
    this.logger.log(`Processing dispute ${disputeId}`);
    return true;
  }
}