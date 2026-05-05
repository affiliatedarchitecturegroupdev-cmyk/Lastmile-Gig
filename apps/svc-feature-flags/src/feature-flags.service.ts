import { Injectable } from '@nestjs/common';

@Injectable()
export class FeatureFlagsService {
  async isEnabled(flag: string): Promise<boolean> { return true; }
}