import { Injectable } from '@nestjs/common';

@Injectable()
export class KPIDashboardService {
  async getKPIs(dashboardId: string): Promise<any[]> { return []; }
}