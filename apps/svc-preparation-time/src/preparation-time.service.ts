import { Injectable } from '@nestjs/common';

@Injectable()
export class PreparationTimeService {
  async calculate(itemIds: string[]): Promise<number> { return 20; }
}