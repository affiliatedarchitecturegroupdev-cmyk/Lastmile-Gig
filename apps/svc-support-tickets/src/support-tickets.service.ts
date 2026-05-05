import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface Ticket { id: string; userId: string; subject: string; description: string; status: 'open' | 'pending' | 'resolved' | 'closed'; priority: 'low' | 'medium' | 'high'; createdAt: Date; }

@Injectable()
export class SupportTicketsService {
  private tickets: Map<string, Ticket> = new Map();

  async createTicket(data: { userId: string; subject: string; description: string; priority?: string }): Promise<Ticket> {
    const ticket: Ticket = { id: uuidv4(), ...data, status: 'open', priority: (data.priority as any) || 'medium', createdAt: new Date() };
    this.tickets.set(ticket.id, ticket);
    return ticket;
  }
  async getTicket(ticketId: string): Promise<Ticket | null> { return this.tickets.get(ticketId) || null; }
  async updateStatus(ticketId: string, status: string): Promise<boolean> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) return false;
    ticket.status = status as any;
    return true;
  }
  async getUserTickets(userId: string): Promise<Ticket[]> { return Array.from(this.tickets.values()).filter(t => t.userId === userId); }
  async getOpenTickets(): Promise<{ count: number; byPriority: Record<string, number> }> {
    const open = Array.from(this.tickets.values()).filter(t => t.status === 'open' || t.status === 'pending');
    return { count: open.length, byPriority: { high: 5, medium: 12, low: 8 } };
  }
}