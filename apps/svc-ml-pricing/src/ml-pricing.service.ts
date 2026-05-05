import { Injectable } from '@nestjs/common';

@Injectable()
export class MLPricingService {
  async predictOptimalPrice(input: any): Promise<number> { return 35; }
}