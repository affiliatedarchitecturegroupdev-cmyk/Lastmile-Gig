import { Injectable } from '@nestjs/common';

@Injectable()
export class FunnelAnalysisService {
  async getFunnel(steps: string[]): Promise<any[]> { return []; }
}