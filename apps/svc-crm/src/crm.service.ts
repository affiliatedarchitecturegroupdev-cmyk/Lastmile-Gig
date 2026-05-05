import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'customer' | 'driver' | 'partner';
  tags: string[];
  lifetimeValue: number;
  ordersCount: number;
}

@Injectable()
export class CRMService {
  private contacts: Map<string, Contact> = new Map();

  async addContact(data: { name: string; email: string; phone: string; type: Contact['type'] }): Promise<Contact> {
    const contact: Contact = { id: uuidv4(), ...data, tags: [], lifetimeValue: 0, ordersCount: 0 };
    this.contacts.set(contact.id, contact);
    return contact;
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<boolean> {
    const c = this.contacts.get(id);
    if (!c) return false;
    this.contacts.set(id, { ...c, ...updates });
    return true;
  }

  async addTag(contactId: string, tag: string): Promise<boolean> {
    const c = this.contacts.get(contactId);
    if (!c) return false;
    if (!c.tags.includes(tag)) c.tags.push(tag);
    return true;
  }

  async getContact(id: string): Promise<Contact | null> { return this.contacts.get(id) || null; }
  async searchContacts(query: string): Promise<Contact[]> { return Array.from(this.contacts.values()).filter(c => c.name.includes(query)); }
  async getTopCustomers(limit?: number): Promise<Contact[]> {
    return Array.from(this.contacts.values()).sort((a, b) => b.lifetimeValue - a.lifetimeValue).slice(0, limit || 10);
  }
}