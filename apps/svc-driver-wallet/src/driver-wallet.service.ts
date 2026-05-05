import { Injectable } from '@nestjs/common';

@Injectable()
export class DriverWalletService {
  async getBalance(driverId: string): Promise<{ available: number; pending: number }> { return { available: 2500, pending: 850 }; }
}