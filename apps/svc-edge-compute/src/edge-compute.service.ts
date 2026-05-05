import { Injectable } from '@nestjs/common';

@Injectable()
export class EdgeComputeService {
  async execute(edgeFunction: string, context: any): Promise<any> { return {}; }
}