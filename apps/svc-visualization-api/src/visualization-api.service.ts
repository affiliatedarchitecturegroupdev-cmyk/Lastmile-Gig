import { Injectable } from '@nestjs/common';

@Injectable()
export class VisualizationAPIService {
  async getChartData(chartType: string): Promise<any> { return { data: [] }; }
}