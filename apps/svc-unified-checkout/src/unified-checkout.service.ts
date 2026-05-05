import { Injectable } from '@nestjs/common';

@Injectable()
export class UnifiedCheckoutService {
  async getCheckoutUrl(orderId: string, methods: string[]): Promise<{ url: string }> { return { url: 'https://checkout.garlaws.com/pay' }; }
}