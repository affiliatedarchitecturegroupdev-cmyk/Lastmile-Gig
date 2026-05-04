import { Injectable } from '@nestjs/common';

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: 'routine' | 'repair' | 'inspection';
  description: string;
  cost: number;
  odometer: number;
  performedAt: Date;
  nextDue: Date | null;
  technician: string;
}

export interface MaintenanceSchedule {
  vehicleId: string;
  serviceType: string;
  intervalMiles: number;
  intervalDays: number;
  nextDueOdometer: number;
  nextDueDate: Date;
}

@Injectable()
export class MaintenanceService {
  private records: Map<string, MaintenanceRecord[]> = new Map();
  private schedules: Map<string, MaintenanceSchedule> = new Map();

  async addRecord(vehicleId: string, dto: any): Promise<MaintenanceRecord> {
    const record: MaintenanceRecord = {
      id: crypto.randomUUID(),
      vehicleId,
      type: dto.type,
      description: dto.description,
      cost: dto.cost,
      odometer: dto.odometer,
      performedAt: new Date(),
      nextDue: dto.nextDue || null,
      technician: dto.technician || 'System',
    };

    const vehicleRecords = this.records.get(vehicleId) || [];
    vehicleRecords.push(record);
    this.records.set(vehicleId, vehicleRecords);

    return record;
  }

  async getRecords(vehicleId: string): Promise<MaintenanceRecord[]> {
    return this.records.get(vehicleId) || [];
  }

  async getUpcoming(vehicleId: string): Promise<MaintenanceSchedule[]> {
    // Return upcoming maintenance
    return [];
  }

  async scheduleMaintenance(vehicleId: string, dto: any): Promise<MaintenanceSchedule> {
    const schedule: MaintenanceSchedule = {
      vehicleId,
      serviceType: dto.serviceType,
      intervalMiles: dto.intervalMiles,
      intervalDays: dto.intervalDays,
      nextDueOdometer: dto.nextDueOdometer,
      nextDueDate: new Date(dto.nextDueDate),
    };

    this.schedules.set(`${vehicleId}:${dto.serviceType}`, schedule);
    return schedule;
  }

  async getTotalCost(vehicleId: string): Promise<number> {
    const records = this.records.get(vehicleId) || [];
    return records.reduce((sum, r) => sum + r.cost, 0);
  }

  async getCostByPeriod(vehicleId: string, start: Date, end: Date): Promise<number> {
    const records = this.records.get(vehicleId) || [];
    return records
      .filter(r => r.performedAt >= start && r.performedAt <= end)
      .reduce((sum, r) => sum + r.cost, 0);
  }
}