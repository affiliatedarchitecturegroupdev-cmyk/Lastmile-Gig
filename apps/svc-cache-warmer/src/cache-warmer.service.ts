import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheWarmerService {
  async warmCache(key: string): Promise<boolean> { return true; }
}