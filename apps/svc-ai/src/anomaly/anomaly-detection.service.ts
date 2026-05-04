import { Injectable } from '@nestjs/common';

export interface AnomalyDetection {
  id: string;
  metric: string;
  timestamp: Date;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high';
  resolved: boolean;
}

@Injectable()
export class AnomalyDetectionService {
  private detections: Map<string, AnomalyDetection[]> = new Map();

  async detect(metric: string, value: number, expectedValue: number): Promise<AnomalyDetection | null> {
    const deviation = Math.abs(value - expectedValue) / expectedValue;
    
    if (deviation > 0.5) {
      const detection: AnomalyDetection = {
        id: crypto.randomUUID(),
        metric,
        timestamp: new Date(),
        value,
        expectedValue,
        deviation,
        severity: deviation > 1.0 ? 'high' : 'medium',
        resolved: false,
      };

      const metricDetections = this.detections.get(metric) || [];
      metricDetections.push(detection);
      this.detections.set(metric, metricDetections);

      return detection;
    }

    return null;
  }

  async getActiveAnomalies(metric?: string): Promise<AnomalyDetection[]> {
    if (metric) {
      const detections = this.detections.get(metric) || [];
      return detections.filter(d => !d.resolved);
    }

    const all: AnomalyDetection[] = [];
    for (const detections of this.detections.values()) {
      all.push(...detections.filter(d => !d.resolved));
    }
    return all;
  }

  async resolveAnomaly(id: string): Promise<void> {
    for (const detections of this.detections.values()) {
      const detection = detections.find(d => d.id === id);
      if (detection) {
        detection.resolved = true;
        return;
      }
    }
  }

  async getAnomalyHistory(metric: string, days = 7): Promise<AnomalyDetection[]> {
    return (this.detections.get(metric) || []).slice(-days);
  }

  async getAnomalyRate(metric: string): Promise<{ total: number; resolved: number; rate: number }> {
    const detections = this.detections.get(metric) || [];
    const resolved = detections.filter(d => d.resolved).length;
    return {
      total: detections.length,
      resolved,
      rate: detections.length > 0 ? resolved / detections.length : 0,
    };
  }

  async detectOrderAnomaly(zone: string, orders: number): Promise<AnomalyDetection | null> {
    const expected = 80; // Would come from prediction service
    return this.detect(`orders:${zone}`, orders, expected);
  }

  async detectDeliveryAnomaly(avgTime: number): Promise<AnomalyDetection | null> {
    const expected = 30;
    return this.detect('delivery_time', avgTime, expected);
  }

  async detectRatingAnomaly(rating: number): Promise<AnomalyDetection | null> {
    const expected = 4.5;
    if (rating < 3.0) {
      return this.detect('rating', rating, expected);
    }
    return null;
  }
}