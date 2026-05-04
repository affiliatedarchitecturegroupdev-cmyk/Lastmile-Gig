import { Injectable } from '@nestjs/common';

export enum VehicleStatus {
  AVAILABLE = 'available',
  IN_USE = 'in_use',
  MAINTENANCE = 'maintenance',
  RETIRED = 'retired',
}

export enum VehicleType {
  BICYCLE = 'bicycle',
  MOTORCYCLE = 'motorcycle',
  CAR = 'car',
  VAN = 'van',
}

export interface Vehicle {
  id: string;
  driverId: string;
  type: VehicleType;
  make: string;
  model: string;
  year: number;
  plate: string;
  vin: string;
  status: VehicleStatus;
  odometer: number;
  fuelLevel: number;
  insuranceExpiry: Date;
  registrationExpiry: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class VehiclesService {
  private vehicles: Map<string, Vehicle> = new Map();

  async register(dto: any): Promise<Vehicle> {
    const vehicle: Vehicle = {
      id: crypto.randomUUID(),
      driverId: dto.driverId,
      type: dto.type,
      make: dto.make,
      model: dto.model,
      year: dto.year,
      plate: dto.plate,
      vin: dto.vin,
      status: VehicleStatus.AVAILABLE,
      odometer: 0,
      fuelLevel: 100,
      insuranceExpiry: new Date(dto.insuranceExpiry),
      registrationExpiry: new Date(dto.registrationExpiry),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.vehicles.set(vehicle.id, vehicle);
    return vehicle;
  }

  async findById(id: string): Promise<Vehicle | null> {
    return this.vehicles.get(id) || null;
  }

  async findByDriver(driverId: string): Promise<Vehicle | null> {
    for (const v of this.vehicles.values()) {
      if (v.driverId === driverId) return v;
    }
    return null;
  }

  async list(status?: VehicleStatus): Promise<Vehicle[]> {
    if (status) {
      return Array.from(this.vehicles.values()).filter(v => v.status === status);
    }
    return Array.from(this.vehicles.values());
  }

  async updateStatus(id: string, status: VehicleStatus): Promise<Vehicle> {
    const vehicle = await this.findById(id);
    if (!vehicle) throw new Error('Vehicle not found');
    vehicle.status = status;
    vehicle.updatedAt = new Date();
    return vehicle;
  }

  async updateOdometer(id: string, odometer: number): Promise<Vehicle> {
    const vehicle = await this.findById(id);
    if (!vehicle) throw new Error('Vehicle not found');
    vehicle.odometer = odometer;
    vehicle.updatedAt = new Date();
    return vehicle;
  }

  async checkExpirations(): Promise<Vehicle[]> {
    const now = new Date();
    const expiring: Vehicle[] = [];
    
    for (const v of this.vehicles.values()) {
      const daysToInsurance = Math.floor((v.insuranceExpiry.getTime() - now.getTime()) / 86400000);
      const daysToRegistration = Math.floor((v.registrationExpiry.getTime() - now.getTime()) / 86400000);
      
      if (daysToInsurance <= 30 || daysToRegistration <= 30) {
        expiring.push(v);
      }
    }
    
    return expiring;
  }
}