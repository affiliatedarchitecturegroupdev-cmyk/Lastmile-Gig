import { Injectable } from '@nestjs/common';

@Injectable()
export class CanaryDeployService {
  async deploy(service: string, version: string, percentage: number): Promise<boolean> { return true; }
}