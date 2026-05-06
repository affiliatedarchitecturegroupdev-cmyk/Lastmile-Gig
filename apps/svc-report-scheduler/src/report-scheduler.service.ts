import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportSchedulerService {
  async createSchedule(config: any): Promise<{ scheduleId: string }> { return { scheduleId: 'sch_1' }; }
}