import { Injectable } from '@nestjs/common';

@Injectable()
export class MLDemandService {
  async predictDemand(locationId: string, hours: number): Promise<number[]> { return [100, 95, 110]; }
}