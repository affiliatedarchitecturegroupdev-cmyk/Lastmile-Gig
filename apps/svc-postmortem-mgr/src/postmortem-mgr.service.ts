import { Injectable } from '@nestjs/common';

@Injectable()
export class PostmortemManagerService {
  async createPostmortem(incidentId: string): Promise<{ postmortemId: string }> { return { postmortemId: 'pm_1' }; }
}