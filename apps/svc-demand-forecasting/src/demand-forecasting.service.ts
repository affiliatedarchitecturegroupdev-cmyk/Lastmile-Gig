import { Injectable } from '@nestjs/common';

@Injectable()
export class DemandForecastingService {
  async forecast(locationId: string, hours: number): Promise<number[]> { return [100, 95, 110]; }
}