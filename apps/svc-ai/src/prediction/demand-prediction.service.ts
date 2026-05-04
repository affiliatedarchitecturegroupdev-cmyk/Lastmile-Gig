import { Injectable } from '@nestjs/common';

export interface DemandForecast {
  date: Date;
  hour: number;
  predictedOrders: number;
  confidenceLow: number;
  confidenceHigh: number;
}

export interface Anomaly {
  id: string;
  type: 'spike' | 'drop' | 'unusual';
  detectedAt: Date;
  value: number;
  threshold: number;
  description: string;
}

@Injectable()
export class DemandPredictionService {
  private forecasts: Map<string, DemandForecast[]> = new Map();
  private anomalies: Anomaly[] = [];

  async predict(zone: string, hoursAhead: number = 24): Promise<DemandForecast[]> {
    const forecasts: DemandForecast[] = [];
    const now = new Date();

    for (let h = 0; h < hoursAhead; h++) {
      const hour = new Date(now.getTime() + h * 3600000).getHours();
      const baseDemand = this.getBaseDemand(hour);
      const dayMultiplier = this.getDayMultiplier(now);
      const weatherFactor = 1.0; // Weather would be fetched
      const eventFactor = 1.0; // Events would be checked

      const predicted = Math.round(baseDemand * dayMultiplier * weatherFactor * eventFactor);

      forecasts.push({
        date: new Date(now.getTime() + h * 3600000),
        hour,
        predictedOrders: predicted,
        confidenceLow: Math.round(predicted * 0.8),
        confidenceHigh: Math.round(predicted * 1.2),
      });
    }

    this.forecasts.set(zone, forecasts);
    return forecasts;
  }

  async getHistoricalDemand(zone: string, start: Date, end: Date): Promise<{ hour: number; avgOrders: number }[]> {
    const hours = [];
    for (let h = 0; h < 24; h++) {
      hours.push({ hour: h, avgOrders: Math.round(this.getBaseDemand(h) * 1.1) });
    }
    return hours;
  }

  async detectAnomalies(zone: string): Promise<Anomaly[]> {
    const threshold = 2.0; // Standard deviations
    
    // Check for anomalies in recent data
    const recentOrders = 100; // Would query DB
    const baseline = 80;
    
    if (recentOrders > baseline * threshold) {
      this.anomalies.push({
        id: crypto.randomUUID(),
        type: 'spike',
        detectedAt: new Date(),
        value: recentOrders,
        threshold: baseline * threshold,
        description: `Unusual order volume: ${recentOrders} vs expected ${baseline}`,
      });
    }
    
    return this.anomalies;
  }

  async recommendPricing(zone: string): Promise<{ multiplier: number; reason: string }> {
    const currentHour = new Date().getHours();
    const prediction = await this.predict(zone, 1);
    const nextHour = prediction[0];
    
    if (nextHour.predictedOrders > 150) {
      return { multiplier: 1.5, reason: 'High demand predicted' };
    } else if (nextHour.predictedOrders < 50) {
      return { multiplier: 0.9, reason: 'Low demand - discount to attract orders' };
    }
    return { multiplier: 1.0, reason: 'Normal demand' };
  }

  async suggestDriverCapacity(zone: string): Promise<{ needed: number; optimal: number }> {
    const prediction = await this.predict(zone, 4);
    const avgNext4 = prediction.slice(0, 4).reduce((s, p) => s + p.predictedOrders, 0) / 4;
    const needed = Math.ceil(avgNext4 / 10);
    return { needed, optimal: needed + 2 };
  }

  private getBaseDemand(hour: number): number {
    const demands: Record<number, number> = {
      0: 5, 1: 3, 2: 2, 3: 1, 4: 1, 5: 2, 6: 10, 7: 25, 8: 45, 9: 60,
      10: 70, 11: 80, 12: 90, 13: 85, 14: 70, 15: 65, 16: 75, 17: 90, 18: 120, 19: 140,
      20: 130, 21: 100, 22: 60, 23: 30,
    };
    return demands[hour] || 20;
  }

  private getDayMultiplier(date: Date): number {
    const day = date.getDay();
    if (day === 5 || day === 6) return 1.3; // Weekend
    if (day === 0) return 0.8; // Sunday
    return 1.0;
  }
}