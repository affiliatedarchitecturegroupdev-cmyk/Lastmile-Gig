import { Injectable } from '@nestjs/common';

@Injectable()
export class InvoicingService {
  async createInvoice(data: any): Promise<{ invoiceId: string }> { return { invoiceId: 'inv_1' }; }
}