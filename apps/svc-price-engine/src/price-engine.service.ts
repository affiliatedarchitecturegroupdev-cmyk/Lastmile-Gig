import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface PriceRule {
  id: string;
  name: string;
  type: PriceRuleType;
  conditions: PriceCondition[];
  adjustments: PriceAdjustment[];
  priority: number;
  active: boolean;
}

export type PriceRuleType = 'base' | 'surge' | 'promo' | 'distance' | 'time';

export interface PriceCondition {
  field: string;
  operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in';
  value: any;
}

export interface PriceAdjustment {
  type: 'fixed' | 'percentage';
  value: number;
  min?: number;
  max?: number;
}

@Injectable()
export class PriceEngineService {
  private readonly logger = new Logger(PriceEngineService.name);
  private rules: Map<string, PriceRule> = new Map();
  private priceHistory: Map<string, { price: number; timestamp: Date }[]> = new Map();

  constructor() {
    this.initRules();
  }

  private initRules(): void {
    const rules: PriceRule[] = [
      { id: 'r1', name: 'Base Price', type: 'base', conditions: [], adjustments: [{ type: 'fixed', value: 0 }], priority: 1, active: true },
      { id: 'r2', name: 'Peak Surge', type: 'surge', conditions: [{ field: 'hour', operator: 'in', value: [11, 12, 17, 18, 19] }], adjustments: [{ type: 'percentage', value: 1.5, min: 10, max: 50 }], priority: 2, active: true },
      { id: 'r3', name: 'Distance Charge', type: 'distance', conditions: [{ field: 'distance', operator: 'gt', value: 2 }], adjustments: [{ type: 'fixed', value: 8 }], priority: 3, active: true },
    ];
    rules.forEach(r => this.rules.set(r.id, r));
  }

  async calculatePrice(input: { subtotal: number; distance: number; hour: number; day: string; coupon?: string }): Promise<{
    subtotal: number;
    deliveryFee: number;
    surgeFee: number;
    discount: number;
    total: number;
    appliedRules: string[];
  }> {
    let deliveryFee = 35;
    let surgeFee = 0;
    let discount = 0;
    const appliedRules: string[] = [];

    // Apply surge
    if ([11, 12, 17, 18, 19].includes(input.hour)) {
      surgeFee = Math.min(50, Math.max(10, input.subtotal * 0.5));
      appliedRules.push('Peak Surge');
    }

    // Distance charge
    if (input.distance > 2) {
      deliveryFee += (input.distance - 2) * 8;
      appliedRules.push('Distance Charge');
    }

    // Apply coupon
    if (input.coupon === 'SAVE10') {
      discount = input.subtotal * 0.1;
      appliedRules.push('SAVE10');
    }

    const total = input.subtotal + deliveryFee + surgeFee - discount;

    return { subtotal: input.subtotal, deliveryFee, surgeFee, discount: Math.round(discount), total: Math.round(total * 100) / 100, appliedRules };
  }

  async createRule(data: Omit<PriceRule, 'id'>): Promise<PriceRule> {
    const rule: PriceRule = { id: uuidv4(), ...data };
    this.rules.set(rule.id, rule);
    return rule;
  }

  async updateRule(ruleId: string, updates: Partial<PriceRule>): Promise<boolean> {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;
    Object.assign(rule, updates);
    this.rules.set(ruleId, rule);
    return true;
  }

  async getRule(ruleId: string): Promise<PriceRule | null> { return this.rules.get(ruleId) || null; }
  async getActiveRules(): Promise<PriceRule[]> { return Array.from(this.rules.values()).filter(r => r.active).sort((a, b) => b.priority - a.priority); }
  async getPriceHistory(orderId: string): Promise<{ price: number; timestamp: Date }[]> { return this.priceHistory.get(orderId) || []; }
}