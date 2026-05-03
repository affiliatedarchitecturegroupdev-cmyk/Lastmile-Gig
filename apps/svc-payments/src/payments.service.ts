import { Injectable, NotFoundException } from '@nestjs/common';

export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  orderId: string;
  customerId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentIntentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PaymentsService {
  private payments: Map<string, Payment> = new Map();

  async createPaymentIntent(amount: number, currency: string, customerId: string): Promise<{ clientSecret: string; paymentId: string }> {
    const payment: Payment = {
      id: crypto.randomUUID(),
      orderId: '',
      customerId,
      amount,
      currency: currency || 'usd',
      status: 'pending',
      stripePaymentIntentId: `pi_${crypto.randomUUID()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.payments.set(payment.id, payment);
    return { clientSecret: `${payment.stripePaymentIntentId}_secret`, paymentId: payment.id };
  }

  async confirmPayment(paymentIntentId: string): Promise<Payment> {
    const payment = Array.from(this.payments.values()).find(p => p.stripePaymentIntentId === paymentIntentId);
    if (!payment) throw new NotFoundException('Payment not found');
    payment.status = 'succeeded';
    payment.updatedAt = new Date();
    return payment;
  }

  async getPayment(id: string): Promise<Payment> {
    const payment = this.payments.get(id);
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async refundPayment(paymentId: string, amount?: number): Promise<Payment> {
    const payment = await this.getPayment(paymentId);
    payment.status = 'refunded';
    payment.updatedAt = new Date();
    return payment;
  }

  async getOrderPayments(orderId: string): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(p => p.orderId === orderId);
  }

  async createPayout(driverId: string, amount: number): Promise<{ payoutId: string; status: string }> {
    return { payoutId: crypto.randomUUID(), status: 'pending' };
  }

  async getDriverBalance(driverId: string): Promise<{ available: number; pending: number }> {
    return { available: 0, pending: 0 };
  }

  async getPaymentHistory(customerId?: string, startDate?: string, endDate?: string): Promise<Payment[]> {
    return Array.from(this.payments.values());
  }
}