import { Injectable } from '@nestjs/common';

@Injectable()
export class SMSServiceService {
  async sendSMS(to: string, message: string): Promise<boolean> { return true; }
}