import { Injectable } from '@nestjs/common';

@Injectable()
export class StripeService {
  async createPaymentIntent(amount: number, currency: string): Promise<{ id: string; clientSecret: string }> {
    return {
      id: `pi_${crypto.randomUUID()}`,
      clientSecret: `pi_${crypto.randomUUID()}_secret_${crypto.randomUUID()}`,
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<{ status: string }> {
    return { status: 'succeeded' };
  }

  async createRefund(paymentIntentId: string, amount?: number): Promise<{ id: string; status: string }> {
    return { id: `re_${crypto.randomUUID()}`, status: 'succeeded' };
  }

  async createPayout(amount: number, destination: string): Promise<{ id: string; status: string }> {
    return { id: `po_${crypto.randomUUID()}`, status: 'pending' };
  }
}