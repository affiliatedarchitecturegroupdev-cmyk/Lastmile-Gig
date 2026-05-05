import { Injectable } from '@nestjs/common';

export type WeatherCondition = 'clear' | 'cloudy' | 'rain' | 'storm' | 'hot' | 'cold' | 'fog';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface WeatherData {
  location: string;
  temperature: number;
  condition: WeatherCondition;
  humidity: number;
  windSpeed: number;
  visibility: number;
  updatedAt: Date;
}

export interface WeatherAlert {
  id: string;
  location: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  condition: WeatherCondition;
  startTime: Date;
  endTime: Date;
  active: boolean;
}

@Injectable()
export class WeatherAlertService {
  private alerts: Map<string, WeatherAlert[]> = new Map();

  /**
   * Get current weather
   */
  async getCurrentWeather(location: string): Promise<WeatherData> {
    // Would fetch from weather API
    return {
      location,
      temperature: 22,
      condition: 'clear',
      humidity: 65,
      windSpeed: 15,
      visibility: 10000,
      updatedAt: new Date(),
    };
  }

  /**
   * Get weather for location
   */
  async getWeatherForZone(zoneId: string): Promise<WeatherData> {
    return this.getCurrentWeather(zoneId);
  }

  /**
   * Generate weather alerts
   */
  async generateAlerts(location: string, weather: WeatherData): Promise<WeatherAlert[]> {
    const alerts: WeatherAlert[] = [];

    if (weather.condition === 'storm') {
      alerts.push({
        id: `alert_${Date.now()}`,
        location,
        severity: 'high',
        title: 'Storm Warning',
        message: 'Thunderstorms expected. Consider adjusting delivery expectations.',
        condition: 'storm',
        startTime: new Date(),
        endTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
        active: true,
      });
    }

    if (weather.temperature > 35) {
      alerts.push({
        id: `alert_${Date.now()}`,
        location,
        severity: 'medium',
        title: 'Extreme Heat',
        message: 'High temperatures may affect food quality during delivery.',
        condition: 'hot',
        startTime: new Date(),
        endTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
        active: true,
      });
    }

    if (weather.visibility < 1000) {
      alerts.push({
        id: `alert_${Date.now()}`,
        location,
        severity: 'critical',
        title: 'Low Visibility',
        message: 'Fog advisory. Expect delays.',
        condition: 'fog',
        startTime: new Date(),
        endTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
        active: true,
      });
    }

    if (weather.condition === 'rain' && weather.windSpeed > 30) {
      alerts.push({
        id: `alert_${Date.now()}`,
        location,
        severity: 'medium',
        title: 'Rain and Wind',
        message: 'Rainy conditions with strong winds. Expected delays.',
        condition: 'rain',
        startTime: new Date(),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        active: true,
      });
    }

    return alerts;
  }

  /**
   * Get active alerts
   */
  async getActiveAlerts(location?: string): Promise<WeatherAlert[]> {
    const allAlerts: WeatherAlert[] = [];
    
    for (const alerts of this.alerts.values()) {
      allAlerts.push(...alerts.filter(a => a.active));
    }

    if (location) {
      return allAlerts.filter(a => a.location === location);
    }

    return allAlerts;
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId: string): Promise<void> {
    for (const alerts of this.alerts.values()) {
      const alert = alerts.find(a => a.id === alertId);
      if (alert) {
        alert.active = false;
        return;
      }
    }
  }

  /**
   * Get 5-day forecast
   */
  async getForecast(location: string): Promise<{
    date: string;
    condition: WeatherCondition;
    high: number;
    low: number;
    rainChance: number;
  }[]> {
    const forecast = [];
    const conditions: WeatherCondition[] = ['clear', 'clear', 'cloudy', 'rain', 'clear'];
    
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        condition: conditions[i],
        high: 22 + Math.floor(Math.random() * 8),
        low: 12 + Math.floor(Math.random() * 5),
        rainChance: conditions[i] === 'rain' ? 70 : conditions[i] === 'cloudy' ? 30 : 10,
      });
    }

    return forecast;
  }

  /**
   * Check delivery impact
   */
  async checkDeliveryImpact(zoneId: string): Promise<{
    impact: 'none' | 'minor' | 'moderate' | 'severe';
    message: string;
    delayEstimate: number;
    recommendations: string[];
  }> {
    const weather = await this.getWeatherForZone(zoneId);
    
    if (weather.condition === 'storm' || weather.visibility < 1000) {
      return {
        impact: 'severe',
        message: 'Severe weather conditions expected',
        delayEstimate: 20,
        recommendations: ['Extend delivery times', 'Notify customers of delays'],
      };
    }

    if (weather.condition === 'rain' || weather.condition === 'hot') {
      return {
        impact: 'moderate',
        message: 'Weather may cause delays',
        delayEstimate: 10,
        recommendations: ['Allow extra time'],
      };
    }

    return {
      impact: 'none',
      message: 'Normal conditions expected',
      delayEstimate: 0,
      recommendations: [],
    };
  }
}