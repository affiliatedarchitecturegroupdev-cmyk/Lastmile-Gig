import { Injectable } from '@nestjs/common';

@Injectable()
export class StripeIntegrationService {
  async createPaymentIntent(amount: number, currency: string): Promise<{ clientSecret: string }> { return { clientSecret: 'pi_...' }; }
}