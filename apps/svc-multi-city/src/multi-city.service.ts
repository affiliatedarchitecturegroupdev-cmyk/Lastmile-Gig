import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export type CityStatus = 'active' | 'launching_soon' | 'pending';

export interface City {
  id: string;
  name: string;
  code: string;
  province: string;
  status: CityStatus;
  timezone: string;
  currency: string;
  pricing: CityPricing;
  partnerCount: number;
  driverCount: number;
}

export interface CityPricing {
  baseDeliveryFee: number;
  minimumOrder: number;
  commissionRate: number;
  peakMultiplier: number;
}

export interface CityExpansion {
  id: string;
  cityId: string;
  phase: number;
  status: 'planning' | 'onboarding' | 'launched';
  targetLaunchDate: Date;
  partnersOnboarded: number;
}

@Injectable()
export class MultiCityService {
  private cities: Map<string, City> = new Map();
  private expansions: Map<string, CityExpansion> = new Map();

  constructor() {
    this.loadCities();
  }

  private loadCities(): void {
    const cities: City[] = [
      { id: 'cpt', name: 'Cape Town', code: 'CPT', province: 'Western Cape', status: 'active', timezone: 'Africa/Johannesburg', currency: 'ZAR', pricing: { baseDeliveryFee: 35, minimumOrder: 100, commissionRate: 0.15, peakMultiplier: 1.5 }, partnerCount: 250, driverCount: 800 },
      { id: 'jhb', name: 'Johannesburg', code: 'JHB', province: 'Gauteng', status: 'active', timezone: 'Africa/Johannesburg', currency: 'ZAR', pricing: { baseDeliveryFee: 35, minimumOrder: 100, commissionRate: 0.15, peakMultiplier: 1.5 }, partnerCount: 400, driverCount: 1200 },
      { id: 'dbn', name: 'Durban', code: 'DBN', province: 'KwaZulu-Natal', status: 'active', timezone: 'Africa/Johannesburg', currency: 'ZAR', pricing: { baseDeliveryFee: 30, minimumOrder: 80, commissionRate: 0.14, peakMultiplier: 1.4 }, partnerCount: 150, driverCount: 400 },
      { id: 'pta', name: 'Pretoria', code: 'PTA', province: 'Gauteng', status: 'active', timezone: 'Africa/Johannesburg', currency: 'ZAR', pricing: { baseDeliveryFee: 30, minimumOrder: 80, commissionRate: 0.14, peakMultiplier: 1.4 }, partnerCount: 120, driverCount: 350 },
      { id: 'bft', name: 'Bloemfontein', code: 'BFT', province: 'Free State', status: 'launching_soon', timezone: 'Africa/Johannesburg', currency: 'ZAR', pricing: { baseDeliveryFee: 25, minimumOrder: 75, commissionRate: 0.13, peakMultiplier: 1.3 }, partnerCount: 0, driverCount: 0 },
      { id: 'plz', name: 'Port Elizabeth', code: 'PLZ', province: 'Eastern Cape', status: 'launching_soon', timezone: 'Africa/Johannesburg', currency: 'ZAR', pricing: { baseDeliveryFee: 25, minimumOrder: 75, commissionRate: 0.13, peakMultiplier: 1.3 }, partnerCount: 0, driverCount: 0 },
      { id: 'nls', name: 'Nelspruit', code: 'NLS', province: 'Mpumalanga', status: 'pending', timezone: 'Africa/Johannesburg', currency: 'ZAR', pricing: { baseDeliveryFee: 25, minimumOrder: 75, commissionRate: 0.13, peakMultiplier: 1.3 }, partnerCount: 0, driverCount: 0 },
    ];

    for (const c of cities) {
      this.cities.set(c.id, c);
    }
  }

  /**
   * Get all cities
   */
  async getAllCities(): Promise<City[]> {
    return Array.from(this.cities.values());
  }

  /**
   * Get active cities
   */
  async getActiveCities(): Promise<City[]> {
    return Array.from(this.cities.values())
      .filter(c => c.status === 'active');
  }

  /**
   * Get city by ID
   */
  async getCity(cityId: string): Promise<City | null> {
    return this.cities.get(cityId) || null;
  }

  /**
   * Get city pricing
   */
  async getCityPricing(cityId: string): Promise<CityPricing | null> {
    const city = this.cities.get(cityId);
    return city?.pricing || null;
  }

  /**
   * Calculate delivery fee
   */
  async calculateDeliveryFee(cityId: string, distance: number, isPeak: boolean): Promise<{
    baseFee: number;
    distanceFee: number;
    peakSurcharge: number;
    total: number;
  }> {
    const city = this.cities.get(cityId);
    if (!city) return { baseFee: 0, distanceFee: 0, peakSurcharge: 0, total: 0 };

    const baseFee = city.pricing.baseDeliveryFee;
    const distanceFee = Math.max(0, (distance - 3) * 5);
    const peakSurcharge = isPeak ? baseFee * (city.pricing.peakMultiplier - 1) : 0;

    return {
      baseFee,
      distanceFee,
      peakSurcharge,
      total: Math.round(baseFee + distanceFee + peakSurcharge),
    };
  }

  /**
   * Search nearby cities
   */
  async getNearbyCities(lat: number, lng: number): Promise<City[]> {
    return Array.from(this.cities.values())
      .filter(c => c.status === 'active')
      .slice(0, 3);
  }

  /**
   * Get expansion status
   */
  async getExpansionStatus(cityId: string): Promise<CityExpansion | null> {
    return this.expansions.get(cityId) || null;
  }

  /**
   * Request city expansion
   */
  async requestExpansion(data: {
    cityName: string;
    targetDate: Date;
  }): Promise<CityExpansion> {
    const expansion: CityExpansion = {
      id: uuidv4(),
      cityId: data.cityName.toLowerCase().replace(/\s/g, ''),
      phase: 1,
      status: 'planning',
      targetLaunchDate: data.targetDate,
      partnersOnboarded: 0,
    };

    this.expansions.set(expansion.id, expansion);
    return expansion;
  }

  /**
   * Get city metrics
   */
  async getCityMetrics(cityId: string): Promise<{
    orders: number;
    revenue: number;
    avgDeliveryTime: number;
    partnerUtilization: number;
  }> {
    return {
      orders: Math.floor(Math.random() * 10000),
      revenue: Math.floor(Math.random() * 500000),
      avgDeliveryTime: 35,
      util: Math.floor(Math.random() * 50) + 50,
    };
  }

  /**
   * Launch city
   */
  async launchCity(cityId: string): Promise<boolean> {
    const city = this.cities.get(cityId);
    if (!city) return false;

    city.status = 'active';
    this.cities.set(cityId, city);
    return true;
  }

  /**
   * Get city list by province
   */
  async getCitiesByProvince(province: string): Promise<City[]> {
    return Array.from(this.cities.values())
      .filter(c => c.province === province);
  }
}