import { Injectable } from '@nestjs/common';

export interface EtaPrediction {
  prepMinutes: number;
  prepConfidence: number;
  deliveryMinutes: number;
  deliveryConfidence: number;
  totalMinutes: number;
  estimatedArrival: Date;
}

@Injectable()
export class EtaService {
  async calculatePrepTime(partnerId: string, itemCount: number): Promise<{ minutes: number; confidence: number }> {
    // Default: 15 min base + 3 min per item
    const baseMinutes = 15;
    const perItemMinutes = 3;
    const estimated = baseMinutes + (perItemMinutes * itemCount);
    
    return {
      minutes: estimated,
      confidence: 0.85,
    };
  }

  async calculateDeliveryTime(
    pickup: { lat: number; lng: number },
    dropoff: { lat: number; lng: number }
  ): Promise<{ minutes: number; distance: number; confidence: number }> {
    const distance = this.calculateDistance(pickup, dropoff);
    const speedKmH = 30; // Average city speed
    const minutes = Math.ceil((distance / speedKmH) * 60);
    
    return {
      minutes: Math.max(minutes, 10),
      distance,
      confidence: 0.90,
    };
  }

  async calculateTotalEta(
    partnerId: string,
    itemCount: number,
    pickup: { lat: number; lng: number },
    dropoff: { lat: number; lng: number }
  ): Promise<EtaPrediction> {
    const prep = await this.calculatePrepTime(partnerId, itemCount);
    const delivery = await this.calculateDeliveryTime(pickup, dropoff);
    const totalMinutes = prep.minutes + delivery.minutes;
    
    return {
      prepMinutes: prep.minutes,
      prepConfidence: prep.confidence,
      deliveryMinutes: delivery.minutes,
      deliveryConfidence: delivery.confidence,
      totalMinutes,
      estimatedArrival: new Date(Date.now() + totalMinutes * 60000),
    };
  }

  private calculateDistance(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(to.lat - from.lat);
    const dLng = this.toRad(to.lng - from.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(from.lat)) * Math.cos(this.toRad(to.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}