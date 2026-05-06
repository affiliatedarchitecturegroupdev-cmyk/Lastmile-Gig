import { Injectable } from '@nestjs/common';

@Injectable()
export class DataExportService {
  async exportData(format: string, data: any): Promise<{ url: string }> { return { url: 'https://...' }; }
}