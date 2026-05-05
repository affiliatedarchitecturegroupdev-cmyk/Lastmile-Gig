import { Injectable } from '@nestjs/common';

@Injectable()
export class ChurnPredictionService {
  async predictChurn(userId: string): Promise<{ probability: number; risk: string }> { return { probability: 0.15, risk: 'low' }; }
}