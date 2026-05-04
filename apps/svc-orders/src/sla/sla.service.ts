import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

interface SlaBreach {
  orderId: string;
  partnerId: string;
  deadline: Date;
  breachedAt: Date;
  delayMinutes: number;
  penalty: number;
}

@Injectable()
export class SlaService {
  private breaches: Map<string, SlaBreach> = new Map();

  @Cron(CronExpression.EVERY_MINUTE)
  async checkSlaBreaches(): Promise<void> {
    const now = new Date();
    const breachedOrders = await this.findBreachedOrders(now);
    
    for (const order of breachedOrders) {
      await this.recordBreach(order.id, order.partnerId, order.slaDeadline);
    }
  }

  async findBreachedOrders(now: Date): Promise<any[]> {
    // Query database for orders past SLA deadline
    return [];
  }

  async recordBreach(orderId: string, partnerId: string, deadline: Date): Promise<SlaBreach> {
    const breachedAt = new Date();
    const delayMinutes = Math.floor((breachedAt.getTime() - deadline.getTime()) / 60000);
    const penalty = this.calculatePenalty(delayMinutes);

    const breach: SlaBreach = {
      orderId,
      partnerId,
      deadline,
      breachedAt,
      delayMinutes,
      penalty,
    };

    this.breaches.set(orderId, breach);
    return breach;
  }

  private calculatePenalty(delayMinutes: number): number {
    if (delayMinutes <= 5) return 0;
    if (delayMinutes <= 10) return 5;
    if (delayMinutes <= 15) return 10;
    if (delayMinutes <= 20) return 15;
    return 20;
  }

  async getBreach(orderId: string): Promise<SlaBreach | null> {
    return this.breaches.get(orderId) || null;
  }

  async getPartnerBreaches(partnerId: string): Promise<SlaBreach[]> {
    return Array.from(this.breaches.values()).filter(b => b.partnerId === partnerId);
  }

  async getBreachRate(partnerId: string, days: number): Promise<number> {
    const breaches = await this.getPartnerBreaches(partnerId);
    // Calculate rate over period
    return breaches.length / days;
  }

  async calculateSlaDeadline(partnerId: string, prepMinutes: number): Promise<Date> {
    const baseMinutes = 45; // Default SLA
    const deadline = new Date(Date.now() + (baseMinutes + prepMinutes) * 60000);
    return deadline;
  }
}