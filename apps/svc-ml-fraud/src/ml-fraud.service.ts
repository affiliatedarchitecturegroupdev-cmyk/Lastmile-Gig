import { Injectable } from '@nestjs/common';

@Injectable()
export class MLFraudService {
  async detectFraud(features: any): Promise<{ probability: number; isFraud: boolean }> { return { probability: 0.1, isFraud: false }; }
}