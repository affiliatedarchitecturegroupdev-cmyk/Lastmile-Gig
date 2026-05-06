import { Injectable } from '@nestjs/common';

@Injectable()
export class WebSDKService {
  async generateWebSDK(): Promise<{ sdk: string }> { return { sdk: '// Web SDK code...' }; }
}