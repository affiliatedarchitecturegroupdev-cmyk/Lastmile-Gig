import { Injectable } from '@nestjs/common';

@Injectable()
export class DataWarehouseService {
  async query(sql: string): Promise<any[]> { return []; }
}