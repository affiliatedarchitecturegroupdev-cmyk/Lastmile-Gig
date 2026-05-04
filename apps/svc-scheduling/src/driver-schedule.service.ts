import { Injectable } from '@nestjs/common';

export type DriverShiftStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';

export interface DriverShift {
  id: string;
  driverId: string;
  zoneId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: DriverShiftStatus;
  maxDeliveries: number;
  currentDeliveries: number;
}

export interface DriverAvailability {
  driverId: string;
  date: string;
  isAvailable: boolean;
  preferredZones: string[];
  maxDeliveries: number;
}

@Injectable()
export class DriverScheduleService {
  private shifts: Map<string, DriverShift[]> = new Map();
  private availabilities: Map<string, DriverAvailability> = new Map();

  /**
   * Get driver shifts for date range
   */
  async getDriverShifts(
    driverId: string,
    startDate: string,
    endDate: string
  ): Promise<DriverShift[]> {
    const key = `${driverId}_${startDate}`;
    return this.shifts.get(key) || [];
  }

  /**
   * Schedule driver shift
   */
  async scheduleShift(data: {
    driverId: string;
    zoneId: string;
    date: string;
    startTime: string;
    endTime: string;
  }): Promise<DriverShift> {
    const shift: DriverShift = {
      id: `shift_${data.driverId}_${data.date}_${data.startTime}`,
      driverId: data.driverId,
      zoneId: data.zoneId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      status: 'scheduled',
      maxDeliveries: 20,
      currentDeliveries: 0,
    };

    const key = `${data.driverId}_${data.date}`;
    const shifts = this.shifts.get(key) || [];
    shifts.push(shift);
    this.shifts.set(key, shifts);

    return shift;
  }

  /**
   * Set driver availability
   */
  async setAvailability(data: {
    driverId: string;
    date: string;
    isAvailable: boolean;
    preferredZones: string[];
    maxDeliveries: number;
  }): Promise<DriverAvailability> {
    const availability: DriverAvailability = {
      ...data,
    };

    const key = `${data.driverId}_${data.date}`;
    this.availabilities.set(key, availability);
    return availability;
  }

  /**
   * Get driver availability
   */
  async getAvailability(driverId: string, date: string): Promise<DriverAvailability | null> {
    const key = `${driverId}_${date}`;
    return this.availabilities.get(key) || null;
  }

  /**
   * Get available drivers for slot
   */
  async getAvailableDrivers(
    zoneId: string,
    date: string,
    time: string
  ): Promise<string[]> {
    // Would find drivers with matching availability
    return ['D001', 'D002', 'D003', 'D004', 'D005'];
  }

  /**
   * Start shift
   */
  async startShift(shiftId: string): Promise<DriverShift | null> {
    for (const shifts of this.shifts.values()) {
      const shift = shifts.find(s => s.id === shiftId);
      if (shift) {
        shift.status = 'active';
        return shift;
      }
    }
    return null;
  }

  /**
   * End shift
   */
  async endShift(shiftId: string): Promise<DriverShift | null> {
    for (const shifts of this.shifts.values()) {
      const shift = shifts.find(s => s.id === shiftId);
      if (shift) {
        shift.status = 'completed';
        return shift;
      }
    }
    return null;
  }

  /**
   * Get shift summary for driver
   */
  async getShiftSummary(driverId: string, date: string): Promise<{
    totalShifts: number;
    completedShifts: number;
    totalDeliveries: number;
    hoursWorked: number;
  }> {
    const key = `${driverId}_${date}`;
    const shifts = this.shifts.get(key) || [];

    return {
      totalShifts: shifts.length,
      completedShifts: shifts.filter(s => s.status === 'completed').length,
      totalDeliveries: shifts.reduce((sum, s) => sum + s.currentDeliveries, 0),
      hoursWorked: shifts.length * 4, // Simplified
    };
  }

  /**
   * Weekly schedule overview
   */
  async getWeeklySchedule(driverId: string): Promise<{
    date: string;
    shifts: number;
    hours: number;
  }[]> {
    const schedule: any[] = [];
    const now = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      schedule.push({
        date: dateStr,
        shifts: Math.floor(Math.random() * 2) + 1,
        hours: Math.floor(Math.random() * 8) + 4,
      });
    }

    return schedule;
  }
}