import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailServiceService {
  async sendEmail(to: string, template: string, data: any): Promise<boolean> { return true; }
}