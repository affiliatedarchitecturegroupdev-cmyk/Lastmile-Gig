import { Injectable } from '@nestjs/common';

@Injectable()
export class AttributionService {
  async attribute(conversionId: string, channels: string[]): Promise<Record<string, number>> { return { google: 0.4, facebook: 0.3, direct: 0.3 }; }
}