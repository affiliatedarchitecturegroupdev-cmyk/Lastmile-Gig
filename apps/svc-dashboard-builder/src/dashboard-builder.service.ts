import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardBuilderService {
  async createDashboard(config: any): Promise<{ dashboardId: string }> { return { dashboardId: 'dash_1' }; }
}