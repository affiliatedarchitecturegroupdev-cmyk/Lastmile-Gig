import { Injectable } from '@nestjs/common';

@Injectable()
export class ChangeManagerService {
  async createChange(data: { title: string; description: string }): Promise<{ changeId: string }> { return { changeId: 'chg_1' }; }
}