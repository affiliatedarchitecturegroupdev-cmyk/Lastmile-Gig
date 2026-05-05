import { Injectable } from '@nestjs/common';

@Injectable()
export class DriverScheduleService {
  async setAvailability(driverId: string, slots: { day: string; start: string; end: string }[]): Promise<boolean> { return true; }
  async getSchedule(driverId: string): Promise<{ day: string; start: string; end: string }[]> { return [{ day: 'Monday', start: '09:00', end: '17:00' }]; }
}