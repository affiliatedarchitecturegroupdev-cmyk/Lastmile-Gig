import { Injectable } from '@nestjs/common';

@Injectable()
export class AnomalyDetectionService {
  async detectAnomalies(metric: string): Promise<any[]> { return []; }
}