import { Injectable } from '@nestjs/common';

@Injectable()
export class DataPipelineService {
  async runPipeline(config: any): Promise<boolean> { return true; }
}