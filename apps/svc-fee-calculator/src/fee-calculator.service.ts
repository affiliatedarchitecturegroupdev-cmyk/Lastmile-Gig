import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class FeeCalculatorService {
  private readonly logger = new Logger(FeeCalculatorService.name);

  async calculate(params: { subtotal: number; distance: number; isPeak: boolean; isRush: boolean; coupon?: string }): Promise<{
    subtotal: number;
    baseFee: number;
    distanceFee: number;
    peakFee: number;
    rushFee: number;
    discount: number;
    total: number;
    breakdown: any;
  }> {
    const baseFee = 25;
    const distanceFee = Math.max(0, params.distance - 2) * 8;
    const peakFee = params.isPeak ? 15 : 0;
    const rushFee = params.isRush ? 25 : 0;
    const discount = params.coupon === 'SAVE20' ? params.subtotal * 0.2 : 0;

    const total = params.subtotal + baseFee + distanceFee + peakFee + rushFee - discount;

    return {
      subtotal: params.subtotal,
      baseFee, distanceFee, peakFee, rushFee,
      discount: Math.round(discount),
      total: Math.round(total * 100) / 100,
      breakdown: { base: baseFee, distance: params.distance, peak: params.isPeak, rush: params.isRush },
    };
  }

  async getFeeBreakdown(feeType: 'delivery' | 'service' | 'payment'): Promise<{ name: string; amount: number; description: string }[]> {
    if (feeType === 'delivery') {
      return [
        { name: 'Base Fee', amount: 25, description: 'Standard delivery fee' },
        { name: 'Distance', amount: 8, description: 'Per km beyond 2km' },
        { name: 'Peak', amount: 15, description: 'Peak hours surcharge' },
      ];
    }
    return [{ name: 'Service Fee', amount: 5, description: 'Platform service fee (5%)' }];
  }
}