import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface PromoCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_delivery';
  value: number;
  minOrder: number;
  maxUses: number;
  usedCount: number;
  validUntil: Date;
}

@Injectable()
export class PromoService {
  private promos: Map<string, PromoCode> = new Map();

  async createPromo(data: { code: string; type: PromoCode['type']; value: number; minOrder: number; maxUses: number; validUntil: Date }): Promise<PromoCode> {
    const promo: PromoCode = { id: uuidv4(), ...data, usedCount: 0 };
    this.promos.set(promo.id, promo);
    return promo;
  }

  async validatePromo(code: string, orderAmount: number): Promise<{ valid: boolean; discount: number; message?: string }> {
    const promo = Array.from(this.promos.values()).find(p => p.code === code);
    if (!promo) return { valid: false, discount: 0, message: 'Invalid code' };
    if (promo.usedCount >= promo.maxUses) return { valid: false, discount: 0, message: 'Max uses reached' };
    if (promo.validUntil < new Date()) return { valid: false, discount: 0, message: 'Expired' };
    if (orderAmount < promo.minOrder) return { valid: false, discount: 0, message: `Min order R${promo.minOrder}` };
    const discount = promo.type === 'percentage' ? orderAmount * (promo.value / 100) : promo.value;
    return { valid: true, discount: Math.round(discount) };
  }

  async applyPromo(code: string): Promise<boolean> {
    const promo = Array.from(this.promos.values()).find(p => p.code === code);
    if (!promo) return false;
    promo.usedCount++;
    return true;
  }

  async getPromoStats(code: string): Promise<{ used: number; remaining: number; discountGiven: number }> {
    const promo = Array.from(this.promos.values()).find(p => p.code === code);
    return { used: promo?.usedCount || 0, remaining: (promo?.maxUses || 0) - (promo?.usedCount || 0), discountGiven: (promo?.usedCount || 0) * 50 };
  }
}