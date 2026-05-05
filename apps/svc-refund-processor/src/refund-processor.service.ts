import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface RefundRequest {
  id: string;
  transactionId: string;
  orderId: string;
  amount: number;
  reason: RefundReason;
  status: RefundStatus;
  processedAt?: Date;
  createdAt: Date;
}

export type RefundReason = 'customer_request' | 'duplicate' | 'fraudulent' | 'service_issue' | 'partial';
export type RefundStatus = 'pending' | 'approved' | 'processing' | 'completed' | 'rejected' | 'failed';

@Injectable()
export class RefundProcessorService {
  private readonly logger = new Logger(RefundProcessorService.name);
  private refunds: Map<string, RefundRequest> = new Map();

  async createRefund(data: { transactionId: string; orderId: string; amount: number; reason: RefundReason }): Promise<RefundRequest> {
    const refund: RefundRequest = {
      id: uuidv4(),
      ...data,
      status: 'pending',
      createdAt: new Date(),
    };

    this.refunds.set(refund.id, refund);
    this.logger.log(`Refund ${refund.id} created: R${data.amount}`);

    refund.status = 'completed';
    refund.processedAt = new Date();
    this.refunds.set(refund.id, refund);

    return refund;
  }

  async getRefund(refundId: string): Promise<RefundRequest | null> { return this.refunds.get(refundId) || null; }
  async getOrderRefunds(orderId: string): Promise<RefundRequest[]> { return Array.from(this.refunds.values()).filter(r => r.orderId === orderId); }
}