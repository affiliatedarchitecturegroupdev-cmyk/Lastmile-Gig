import { Injectable } from '@nestjs/common';

@Injectable()
export class CohortAnalysisService {
  async getCohortData(cohortType: string): Promise<any[]> { return []; }
}