import { Injectable } from '@nestjs/common';

export interface Refund {
  id: string;
  orderId: string;
  transactionId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'processed' | 'rejected';
  createdAt: Date;
  processedAt?: Date;
  processedBy?: string;
}

@Injectable()
export class RefundsService {
  private refunds: Map<string, Refund[]> = new Map();

  async requestRefund(orderId: string, transactionId: string, amount: number, reason: string): Promise<Refund> {
    const refund: Refund = {
      id: crypto.randomUUID(),
      orderId,
      transactionId,
      amount,
      reason,
      status: 'pending',
      createdAt: new Date(),
    };

    const orderRefunds = this.refunds.get(orderId) || [];
    orderRefunds.push(refund);
    this.refunds.set(orderId, orderRefunds);

    // Auto-approve for amounts under R200
    if (amount < 200) {
      refund.status = 'approved';
      refund.processedAt = new Date();
    }

    return refund;
  }

  async getRefunds(orderId: string): Promise<Refund[]> {
    return this.refunds.get(orderId) || [];
  }

  async approveRefund(id: string, approvedBy: string): Promise<Refund> {
    for (const refunds of this.refunds.values()) {
      const refund = refunds.find(r => r.id === id);
      if (refund && refund.status === 'pending') {
        refund.status = 'approved';
        refund.processedAt = new Date();
        refund.processedBy = approvedBy;
        return refund;
      }
    }
    throw new Error('Refund not found');
  }

  async rejectRefund(id: string, reason: string): Promise<Refund> {
    for (const refunds of this.refunds.values()) {
      const refund = refunds.find(r => r.id === id);
      if (refund && refund.status === 'pending') {
        refund.status = 'rejected';
        return refund;
      }
    }
    throw new Error('Refund not found');
  }

  async processRefund(id: string): Promise<Refund> {
    for (const refunds of this.refunds.values()) {
      const refund = refunds.find(r => r.id === id);
      if (refund && refund.status === 'approved') {
        refund.status = 'processed';
        refund.processedAt = new Date();
        return refund;
      }
    }
    throw new Error('Refund not found or not approved');
  }

  async calculateRefundAmount(orderId: string): Promise<number> {
    const refunds = this.refunds.get(orderId) || [];
    return refunds.filter(r => r.status === 'processed').reduce((s, r) => s + r.amount, 0);
  }
}