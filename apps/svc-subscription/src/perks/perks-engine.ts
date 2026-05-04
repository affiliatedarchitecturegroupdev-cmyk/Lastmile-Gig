import { Injectable } from '@nestjs/common';
import { SubscriptionBenefit, SubscriptionPerk } from './subscription.service';

export interface OrderPricing {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  serviceFee: number;
  tip: number;
  total: number;
}

export interface AppliedPerk {
  perkId: string;
  type: string;
  description: string;
  savings: number;
}

@Injectable()
export class PerksEngine {
  /**
   * Calculate perks for a given order based on subscription tier
   */
  calculatePerks(
    subtotal: number,
    deliveryFee: number,
    perks: SubscriptionPerk[]
  ): { applied: AppliedPerk[]; savings: number } {
    const applied: AppliedPerk[] = [];
    let totalSavings = 0;

    for (const perk of perks) {
      if (perk.type === 'free_delivery') {
        const minValue = perk.minOrderValue || 0;
        if (subtotal >= minValue) {
          applied.push({
            perkId: perk.id,
            type: 'free_delivery',
            description: perk.description,
            savings: deliveryFee,
          });
          totalSavings += deliveryFee;
        }
      } else if (perk.type === 'discount') {
        const discountAmount = (subtotal * perk.value) / 100;
        applied.push({
          perkId: perk.id,
          type: 'discount',
          description: `${perk.value}% off (R${discountAmount.toFixed(2)})`,
          savings: discountAmount,
        });
        totalSavings += discountAmount;
      }
    }

    return { applied, savings: totalSavings };
  }

  /**
   * Calculate final order pricing with perks applied
   */
  calculatePricing(
    subtotal: number,
    deliveryFee: number,
    tip: number,
    perks: SubscriptionPerk[]
  ): OrderPricing {
    const { applied, savings } = this.calculatePerks(subtotal, deliveryFee, perks);

    // Apply discount to subtotal
    const discount = savings; // Discount includes free delivery + percentage discount

    // Reduce delivery fee if free delivery applied
    let finalDeliveryFee = deliveryFee;
    for (const perk of applied) {
      if (perk.type === 'free_delivery') {
        finalDeliveryFee = 0;
      }
    }

    // Calculate service fee on reduced subtotal
    const serviceFee = Math.round((subtotal - discount) * 0.05);

    const total = subtotal - discount + finalDeliveryFee + serviceFee + tip;

    return {
      subtotal,
      discount,
      deliveryFee: finalDeliveryFee,
      serviceFee,
      tip,
      total: Math.max(0, total),
    };
  }

  /**
   * Calculate savings summary for display
   */
  getSavingsSummary(
    subtotal: number,
    appliedPerks: AppliedPerk[]
  ): { savings: number; summary: string[] } {
    const summary: string[] = [];
    let savings = 0;

    for (const perk of appliedPerks) {
      savings += perk.savings;
      summary.push(perk.description);
    }

    return { savings, summary };
  }

  /**
   * Check if order qualifies for specific perk
   */
  qualifiesForPerk(orderValue: number, perk: SubscriptionPerk): boolean {
    const minValue = perk.minOrderValue || 0;

    if (perk.type === 'free_delivery') {
      return orderValue >= minValue;
    }

    if (perk.type === 'discount') {
      return orderValue > 0;
    }

    return false;
  }

  /**
   * Calculate value of subscription for the user
   */
  calculateSubscriptionValue(
    monthlyOrders: number,
    averageOrderValue: number,
    perks: SubscriptionPerk[]
  ): { totalSavings: number; valuePerR1: number } {
    let totalSavings = 0;

    for (let i = 0; i < monthlyOrders; i++) {
      const result = this.calculatePerks(averageOrderValue, 35, perks);
      totalSavings += result.savings;
    }

    const subscriptionCost = 99; // Basic tier
    const valuePerR1 = totalSavings / subscriptionCost;

    return { totalSavings, valuePerR1 };
  }

  /**
   * Get available perks tiers for display
   */
  getPerksComparison(): { tier: string; value: string; description: string }[] {
    return [
      { tier: 'Basic', value: 'R150/mo', description: '5% off + Free delivery on orders over R150' },
      { tier: 'Premium', value: 'R300/mo', description: '10% off + Free delivery always + Priority support' },
    ];
  }
}