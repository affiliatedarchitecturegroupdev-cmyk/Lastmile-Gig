import { Injectable } from '@nestjs/common';

export interface DemandForecast {
  zoneId: string;
  hour: number;
  predictedOrders: number;
  confidence: number;
  factors: { name: string; impact: number }[];
}

export interface DemandTrend {
  date: string;
  predicted: number;
  actual?: number;
  variance: number;
}

@Injectable()
export class DemandForecastService {
  /**
   * Forecast demand for zone and hour
   */
  async forecastDemand(zoneId: string, date: Date): Promise<DemandForecast[]> {
    const forecasts: DemandForecast[] = [];
    
    for (let hour = 6; hour < 24; hour++) {
      // Base demand
      let baseDemand = 15;
      
      // Time-based multipliers
      if (hour >= 11 && hour < 14) baseDemand = 45; // Lunch
      else if (hour >= 18 && hour < 21) baseDemand = 65; // Dinner
      else if (hour >= 21 && hour < 23) baseDemand = 35;
      
      // Add randomness
      const predictedOrders = Math.floor(baseDemand * (0.8 + Math.random() * 0.4));
      const confidence = 0.85 + Math.random() * 0.1;
      
      forecasts.push({
        zoneId,
        hour,
        predictedOrders,
        confidence,
        factors: [
          { name: 'Time of Day', impact: hour >= 18 && hour < 21 ? 0.5 : 0.2 },
          { name: 'Day of Week', impact: 0.15 },
          { name: 'Weather', impact: 0.1 },
          { name: 'Events', impact: 0.05 },
        ],
      });
    }
    
    return forecasts;
  }

  /**
   * Get hourly demand predictions
   */
  async getHourlyPredictions(zoneId: string, date: string): Promise<{ hour: number; demand: number }[]> {
    const forecasts = await this.forecastDemand(zoneId, new Date(date));
    
    return forecasts.map(f => ({
      hour: f.hour,
      demand: f.predictedOrders,
    }));
  }

  /**
   * Calculate historical demand
   */
  async getHistoricalDemand(zoneId: string, days: number = 7): Promise<DemandTrend[]> {
    const trends: DemandTrend[] = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const predicted = Math.floor(150 + Math.random() * 100);
      const actual = predicted + Math.floor((Math.random() - 0.5) * 30);
      const variance = predicted > 0 ? ((actual - predicted) / predicted) * 100 : 0;
      
      trends.push({
        date: date.toISOString().split('T')[0],
        predicted,
        actual,
        variance,
      });
    }
    
    return trends;
  }

  /**
   * Get peak hour predictions
   */
  async getPeakHours(zoneId: string): Promise<{ hour: number; demand: number }[]> {
    const forecasts = await this.forecastDemand(zoneId, new Date());
    
    return forecasts
      .filter(f => f.predictedOrders > 40)
      .sort((a, b) => b.predictedOrders - a.predictedOrders)
      .map(f => ({ hour: f.hour, demand: f.predictedOrders }));
  }

  /**
   * Predict driver requirements
   */
  async predictDriverNeeds(zoneId: string, hour: number): Promise<{
    required: number;
    current: number;
    shortage: number;
  }> {
    const forecasts = await this.forecastDemand(zoneId, new Date());
    const forecast = forecasts.find(f => f.hour === hour);
    
    const required = forecast ? Math.ceil(forecast.predictedOrders * 0.3) : 10;
    const current = Math.floor(Math.random() * 20) + 10;
    
    return {
      required,
      current,
      shortage: Math.max(0, required - current),
    };
  }

  /**
   * Get week ahead forecast
   */
  async getWeekAheadForecast(zoneId: string): Promise<{
    date: string;
    predictedOrders: number;
    confidence: number;
  }[]> {
    const weekForecast: any[] = [];
    const now = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      
      const dayOfWeek = date.getDay();
      const multiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.3 : 1;
      
      weekForecast.push({
        date: date.toISOString().split('T')[0],
        predictedOrders: Math.floor(180 * multiplier * (0.9 + Math.random() * 0.2)),
        confidence: 0.80 + Math.random() * 0.15,
      });
    }
    
    return weekForecast;
  }

  /**
   * Anomaly detection
   */
  async detectAnomalies(zoneId: string, days: number = 7): Promise<{
    date: string;
    expected: number;
    actual: number;
    anomaly: boolean;
  }[]> {
    const history = await this.getHistoricalDemand(zoneId, days);
    
    return history.map(h => ({
      date: h.date,
      expected: h.predicted,
      actual: h.actual || 0,
      anomaly: Math.abs(h.variance) > 20,
    }));
  }

  /**
   * Get supply-demand gap
   */
  async getSupplyDemandGap(zoneId: string): Promise<{
    zoneId: string;
    hourlyGap: { hour: number; gap: number }[];
    recommendation: string;
  }> {
    const forecasts = await this.forecastDemand(zoneId, new Date());
    
    const gaps = forecasts.map(f => {
      const supply = 20; // Assume current drivers
      const demand = f.predictedOrders * 0.3;
      return {
        hour: f.hour,
        gap: Math.round(demand - supply),
      };
    });
    
    const hasShortage = gaps.some(g => g.gap > 5);
    
    return {
      zoneId,
      hourlyGap: gaps,
      recommendation: hasShortage ? 'Recruit more drivers for peak hours' : 'Driver capacity adequate',
    };
  }
}