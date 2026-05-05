import { Injectable } from '@nestjs/common';

@Injectable()
export class ChaosEngineService {
  async injectFailure(experiment: any): Promise<boolean> { return true; }
}