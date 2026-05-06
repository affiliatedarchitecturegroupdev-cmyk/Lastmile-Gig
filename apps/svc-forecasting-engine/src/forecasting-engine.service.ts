import { Injectable } from '@nestjs/common';

@Injectable()
export class ForecastingEngineService {
  async forecast(metric: string, periods: number): Promise<number[]> { return []; }
}