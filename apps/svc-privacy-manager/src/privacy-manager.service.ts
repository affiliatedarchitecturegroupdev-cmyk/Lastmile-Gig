import { Injectable } from '@nestjs/common';

@Injectable()
export class PrivacyManagerService {
  async anonymize(data: any): Promise<any> { return data; }
}