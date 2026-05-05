import { Injectable } from '@nestjs/common';

export interface DeliveryFeeCalculation {
  baseFee: number;
  distanceFee: number;
  peakFee: number;
  rushFee: number;
  total: number;
}

@Injectable()
export class DeliveryFeeService {
  async calculateFee(data: { distance: number; isPeak: boolean; isRush: boolean; zone: string }): Promise<DeliveryFeeCalculation> {
    const baseFee = 25;
    const distanceFee = Math.max(0, data.distance - 2) * 8;
    const peakFee = data.isPeak ? baseFee * 0.5 : 0;
    const rushFee = data.isRush ? 15 : 0;
    return { baseFee, distanceFee, peakFee, rushFee, total: baseFee + distanceFee + peakFee + rushFee };
  }

  async getFeeBreakdown(orderId: string): Promise<DeliveryFeeCalculation> {
    return { baseFee: 25, distanceFee: 35, peakFee: 0, rushFee: 0, total: 60 };
  }

  async getZonePricing(zoneId: string): Promise<{ baseFee: number; perKmFee: number; peakMultiplier: number }> {
    return { baseFee: 25, perKmFee: 8, peakMultiplier: 1.5 };
  }

  async applyDiscount(code: string, amount: number): Promise<{ discount: number; finalAmount: number }> {
    const discount = code === 'SAVE10' ? amount * 0.1 : 0;
    return { discount, finalAmount: amount - discount };
  }
}