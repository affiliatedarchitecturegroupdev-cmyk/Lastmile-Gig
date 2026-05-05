import { Injectable, Logger } from '@nestjs/common';

export interface DispatchCandidate {
  driverId: string;
  distance: number;
  rating: number;
  availability: number;
  score: number;
}

@Injectable()
export class DispatchAlgorithmService {
  private readonly logger = new Logger(DispatchAlgorithmService.name);

  async findBestDriver(orderLocation: { lat: number; lng: number }, availableDrivers: any[]): Promise<DispatchCandidate | null> {
    if (availableDrivers.length === 0) return null;

    const candidates: DispatchCandidate[] = availableDrivers.map(d => {
      const distance = Math.sqrt(Math.pow(orderLocation.lat - d.lat, 2) + Math.pow(orderLocation.lng - d.lng, 2)) * 111;
      const score = (d.rating * 40) + ((1 / Math.max(distance, 0.5)) * 30) + (d.availability * 30);
      return { driverId: d.id, distance, rating: d.rating, availability: d.availability, score: Math.round(score * 100) / 100 };
    });

    candidates.sort((a, b) => b.score - a.score);
    return candidates[0];
  }

  async rankDrivers(orderLocation: { lat: number; lng: number }, drivers: any[]): Promise<DispatchCandidate[]> {
    return drivers.map(d => {
      const distance = Math.sqrt(Math.pow(orderLocation.lat - d.lat, 2) + Math.pow(orderLocation.lng - d.lng, 2)) * 111;
      const score = (d.rating * 40) + ((1 / Math.max(distance, 0.5)) * 30) + (d.availability * 30);
      return { driverId: d.id, distance, rating: d.rating, availability: d.availability, score: Math.round(score * 100) / 100 };
    }).sort((a, b) => b.score - a.score);
  }
}