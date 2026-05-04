import { Injectable } from '@nestjs/common';

export interface OperatingHours {
  partnerId: string;
  timezone: string;
  schedule: DaySchedule[];
}

export interface DaySchedule {
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
}

@Injectable()
export class OperatingHoursService {
  private hours: Map<string, OperatingHours> = new Map();

  async setHours(partnerId: string, dto: Partial<OperatingHours>): Promise<OperatingHours> {
    // Validate hours
    this.validateSchedule(dto.schedule || []);

    const hours: OperatingHours = {
      partnerId,
      timezone: dto.timezone || 'Africa/Johannesburg',
      schedule: dto.schedule || this.defaultSchedule(),
    };

    this.hours.set(partnerId, hours);
    return hours;
  }

  async getHours(partnerId: string): Promise<OperatingHours | null> {
    return this.hours.get(partnerId) || null;
  }

  async isOpen(partnerId: string): Promise<boolean> {
    const hours = await this.getHours(partnerId);
    if (!hours) return false;

    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);

    const day = hours.schedule.find(d => d.dayOfWeek === dayOfWeek);
    if (!day || !day.isOpen) return false;

    if (day.openTime && day.closeTime) {
      return currentTime >= day.openTime && currentTime < day.closeTime;
    }

    return false;
  }

  async getNextOpen(partnerId: string): Promise<Date | null> {
    const hours = await this.getHours(partnerId);
    if (!hours) return null;

    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(now.getTime() + i * 86400000);
      const dayOfWeek = checkDate.getDay();
      const day = hours.schedule.find(d => d.dayOfWeek === dayOfWeek);

      if (day && day.isOpen && day.openTime) {
        const [hours, minutes] = day.openTime.split(':').map(Number);
        checkDate.setHours(hours, minutes, 0, 0);
        return checkDate;
      }
    }

    return null;
  }

  async getUpcomingClosings(partnerId: string): Promise<{ time: Date; reason: string }[]> {
    return [];
  }

  private validateSchedule(schedule: DaySchedule[]): void {
    for (const day of schedule) {
      if (day.isOpen) {
        if (!day.openTime || !day.closeTime) {
          throw new Error('Open days must have hours');
        }
        if (day.openTime >= day.closeTime) {
          throw new Error('Close time must be after open time');
        }
      }
    }
  }

  private defaultSchedule(): DaySchedule[] {
    return [
      { dayOfWeek: 0, isOpen: false, openTime: null, closeTime: null },
      { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '22:00' },
      { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '22:00' },
      { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '22:00' },
      { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '22:00' },
      { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '23:00' },
      { dayOfWeek: 6, isOpen: true, openTime: '09:00', closeTime: '23:00' },
    ];
  }
}