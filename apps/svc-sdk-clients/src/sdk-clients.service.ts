import { Injectable } from '@nestjs/common';

@Injectable()
export class SDKClientsService {
  async generateClient(language: string): Promise<{ code: string }> { return { code: '// Client SDK code...' }; }
}