import { Injectable } from '@nestjs/common';

@Injectable()
export class CSVExportService {
  async exportToCSV(data: any): Promise<{ csvUrl: string }> { return { csvUrl: 'https://...' }; }
}