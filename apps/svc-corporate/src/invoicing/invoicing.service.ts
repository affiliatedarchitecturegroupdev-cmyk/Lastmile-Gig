import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  companyId: string;
  invoiceNumber: string;
  periodStart: Date;
  periodEnd: Date;
  subtotal: number;
  vat: number;
  total: number;
  status: InvoiceStatus;
  dueDate: Date;
  paidAt?: Date;
  createdAt: Date;
  lineItems: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoicePayment {
  id: string;
  invoiceId: string;
  amount: number;
  method: 'eft' | 'debit';
  reference: string;
  timestamp: Date;
}

@Injectable()
export class InvoicingService {
  private invoices: Map<string, Invoice> = new Map();
  private payments: Map<string, InvoicePayment[]> = new Map();
  private invoiceCounter: number = 1000;

  /**
   * Generate monthly invoice for company
   */
  async generateMonthlyInvoice(
    companyId: string,
    periodStart: Date,
    periodEnd: Date,
    orders: any[]
  ): Promise<Invoice> {
    const invoiceNumber = this.generateInvoiceNumber();

    // Group orders by category for line items
    const lineItems = this.aggregateOrders(orders);

    const subtotal = orders.reduce((sum, o) => sum + o.total, 0);
    const vat = subtotal * 0.15; // 15% VAT

    const invoice: Invoice = {
      id: uuidv4(),
      companyId,
      invoiceNumber,
      periodStart,
      periodEnd,
      subtotal,
      vat,
      total: subtotal + vat,
      status: 'draft',
      dueDate: new Date(periodEnd.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
      createdAt: new Date(),
      lineItems,
    };

    this.invoices.set(invoice.id, invoice);
    return invoice;
  }

  private generateInvoiceNumber(): string {
    this.invoiceCounter++;
    const date = new Date();
    return `INV${date.getFullYear()}${date.getMonth().toString().padStart(2, '0')}${this.invoiceCounter.toString().padStart(5, '0')}`;
  }

  private aggregateOrders(orders: any[]): InvoiceLineItem[] {
    const categories: Record<string, number> = {};

    for (const order of orders) {
      const category = order.category || 'Standard Orders';
      categories[category] = (categories[category] || 0) + order.total;
    }

    return Object.entries(categories).map(([description, total]) => ({
      description,
      quantity: orders.filter(o => (o.category || 'Standard Orders') === description).length,
      unitPrice: 1,
      total,
    }));
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(invoiceId: string): Promise<Invoice | null> {
    return this.invoices.get(invoiceId) || null;
  }

  /**
   * Get company invoices
   */
  async getCompanyInvoices(companyId: string, status?: InvoiceStatus): Promise<Invoice[]> {
    const companyInvoices = Array.from(this.invoices.values())
      .filter(i => i.companyId === companyId);

    if (status) {
      return companyInvoices.filter(i => i.status === status);
    }
    return companyInvoices;
  }

  /**
   * Mark invoice as sent
   */
  async sendInvoice(invoiceId: string): Promise<Invoice | null> {
    const invoice = this.invoices.get(invoiceId);
    if (invoice) {
      invoice.status = 'pending';
      this.invoices.set(invoiceId, invoice);
    }
    return invoice || null;
  }

  /**
   * Record payment
   */
  async recordPayment(
    invoiceId: string,
    amount: number,
    method: 'eft' | 'debit',
    reference: string
  ): Promise<Invoice | null> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) return null;

    const payment: InvoicePayment = {
      id: uuidv4(),
      invoiceId,
      amount,
      method,
      reference,
      timestamp: new Date(),
    };

    const invoicePayments = this.payments.get(invoiceId) || [];
    invoicePayments.push(payment);
    this.payments.set(invoiceId, invoicePayments);

    // Check if fully paid
    const totalPaid = invoicePayments.reduce((sum, p) => sum + p.amount, 0);
    if (totalPaid >= invoice.total) {
      invoice.status = 'paid';
      invoice.paidAt = new Date();
    }

    this.invoices.set(invoiceId, invoice);
    return invoice;
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(invoiceId: string): Promise<InvoicePayment[]> {
    return this.payments.get(invoiceId) || [];
  }

  /**
   * Get overdue invoices
   */
  async getOverdueInvoices(): Promise<Invoice[]> {
    const now = new Date();
    return Array.from(this.invoices.values())
      .filter(i => i.status === 'pending' && i.dueDate < now);
  }

  /**
   * Generate summary report
   */
  async getInvoiceSummary(companyId: string): Promise<{
    totalDue: number;
    totalPaid: number;
    overdueAmount: number;
    invoiceCount: number;
  }> {
    const invoices = await this.getCompanyInvoices(companyId);
    const now = new Date();

    let totalDue = 0;
    let totalPaid = 0;
    let overdueAmount = 0;

    for (const invoice of invoices) {
      if (invoice.status === 'paid') {
        totalPaid += invoice.total;
      } else if (invoice.status === 'pending') {
        totalDue += invoice.total;
        if (invoice.dueDate < now) {
          overdueAmount += invoice.total;
        }
      }
    }

    return {
      totalDue,
      totalPaid,
      overdueAmount,
      invoiceCount: invoices.length,
    };
  }

  /**
   * Send invoice reminder
   */
  async sendReminder(invoiceId: string): Promise<void> {
    const invoice = this.invoices.get(invoiceId);
    if (invoice && invoice.status === 'pending') {
      // Would integrate with email service
      console.log(`Reminder sent for invoice ${invoice.invoiceNumber}`);
    }
  }
}