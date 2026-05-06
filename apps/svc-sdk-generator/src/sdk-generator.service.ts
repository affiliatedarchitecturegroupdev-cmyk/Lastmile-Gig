import { Injectable } from '@nestjs/common';

@Injectable()
export class SDKGeneratorService {
  async generateSDK(language: string): Promise<{ code: string }> { return { code: '// SDK code...' }; }
}