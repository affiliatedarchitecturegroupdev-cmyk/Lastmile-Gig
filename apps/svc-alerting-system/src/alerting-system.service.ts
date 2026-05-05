import { Injectable } from '@nestjs/common';

@Injectable()
export class AlertingSystemService {
  async sendAlert(alert: { severity: string; message: string }): Promise<boolean> { return true; }
}