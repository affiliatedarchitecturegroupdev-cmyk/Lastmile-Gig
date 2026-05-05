import { Injectable } from '@nestjs/common';

@Injectable()
export class PushNotificationsService {
  async send(userId: string, notification: any): Promise<boolean> { return true; }
}