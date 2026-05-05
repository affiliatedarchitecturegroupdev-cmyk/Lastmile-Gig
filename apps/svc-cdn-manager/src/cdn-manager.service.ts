import { Injectable } from '@nestjs/common';

@Injectable()
export class CDNManagerService {
  async purgeCache(path: string): Promise<boolean> { return true; }
}