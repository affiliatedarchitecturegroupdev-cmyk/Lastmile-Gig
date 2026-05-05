import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export type WaitlistStatus = 'waiting' | 'ready' | 'seated' | 'cancelled' | 'no_show';
export type WaitlistSource = 'app' | 'phone' | 'walk_in';

export interface WaitlistEntry {
  id: string;
  partyId: string;
  partnerId: string;
  customerId: string;
  customerName: string;
  phone: string;
  partySize: number;
  status: WaitlistStatus;
  estimatedWaitTime: number; // minutes
  actualWaitTime?: number;
  position: number;
  source: WaitlistSource;
  specialRequests?: string;
  addedAt: Date;
  notifiedAt?: Date;
  seatedAt?: Date;
}

export interface WaitlistSummary {
  partnerId: string;
  partnerName: string;
  currentWait: number;
  avgWaitTime: number;
  partiesWaiting: number;
  tablesAvailable: number;
}

@Injectable()
export class WaitlistService {
  private waitlists: Map<string, WaitlistEntry[]> = new Map();

  /**
   * Add party to waitlist
   */
  async addToWaitlist(data: {
    partnerId: string;
    partnerName: string;
    customerId: string;
    customerName: string;
    phone: string;
    partySize: number;
    source: WaitlistSource;
    specialRequests?: string;
  }): Promise<WaitlistEntry> {
    const key = data.partnerId;
    const entries = this.waitlists.get(key) || [];
    
    const position = entries.filter(e => e.status === 'waiting').length + 1;
    const estimatedWaitTime = this.calculateWaitTime(position, data.partySize);

    const entry: WaitlistEntry = {
      id: uuidv4(),
      partyId: `party_${Date.now()}`,
      ...data,
      status: 'waiting',
      estimatedWaitTime,
      position,
      addedAt: new Date(),
    };

    entries.push(entry);
    this.waitlists.set(key, entries);

    return entry;
  }

  /**
   * Calculate wait time
   */
  private calculateWaitTime(position: number, partySize: number): number {
    // Base: 10 minutes per party
    // Add 5 minutes per position
    // Adjust for party size
    let wait = 10 + (position - 1) * 5;
    if (partySize > 4) wait += 10;
    if (partySize > 6) wait += 15;
    return wait;
  }

  /**
   * Get waitlist for partner
   */
  async getWaitlist(partnerId: string): Promise<WaitlistEntry[]> {
    const entries = this.waitlists.get(partnerId) || [];
    return entries.filter(e => e.status === 'waiting' || e.status === 'ready');
  }

  /**
   * Get party status
   */
  async getPartyStatus(entryId: string): Promise<{
    status: WaitlistStatus;
    position: number;
    estimatedWaitTime: number;
  } | null> {
    for (const entries of this.waitlists.values()) {
      const entry = entries.find(e => e.id === entryId);
      if (entry) {
        return {
          status: entry.status,
          position: entry.position,
          estimatedWaitTime: entry.estimatedWaitTime,
        };
      }
    }
    return null;
  }

  /**
   * Mark party as ready
   */
  async markReady(entryId: string): Promise<WaitlistEntry | null> {
    for (const [partnerId, entries] of this.waitlists.entries()) {
      const entry = entries.find(e => e.id === entryId);
      if (entry) {
        entry.status = 'ready';
        entry.notifiedAt = new Date();
        this.waitlists.set(partnerId, entries);
        return entry;
      }
    }
    return null;
  }

  /**
   * Seat party
   */
  async seatParty(entryId: string): Promise<WaitlistEntry | null> {
    for (const [partnerId, entries] of this.waitlists.entries()) {
      const entry = entries.find(e => e.id === entryId);
      if (entry) {
        entry.status = 'seated';
        entry.seatedAt = new Date();
        entry.actualWaitTime = Math.floor(
          (entry.seatedAt.getTime() - entry.addedAt.getTime()) / 60000
        );
        
        // Reorder positions
        const waiting = entries.filter(e => 
          e.status === 'waiting' && e.position > entry.position
        );
        for (const w of waiting) {
          w.position--;
          w.estimatedWaitTime = this.calculateWaitTime(w.position, w.partySize);
        }
        
        this.waitlists.set(partnerId, entries);
        return entry;
      }
    }
    return null;
  }

  /**
   * Cancel waitlist entry
   */
  async cancelEntry(entryId: string): Promise<boolean> {
    for (const [partnerId, entries] of this.waitlists.entries()) {
      const index = entries.findIndex(e => e.id === entryId);
      if (index >= 0) {
        const entry = entries[index];
        entry.status = 'cancelled';
        
        // Reorder positions
        const waiting = entries.filter(e => 
          e.status === 'waiting' && e.position > entry.position
        );
        for (const w of waiting) {
          w.position--;
          w.estimatedWaitTime = this.calculateWaitTime(w.position, w.partySize);
        }
        
        this.waitlists.set(partnerId, entries);
        return true;
      }
    }
    return false;
  }

  /**
   * Get waitlist summary
   */
  async getWaitlistSummary(partnerId: string): Promise<WaitlistSummary | null> {
    const entries = this.waitlists.get(partnerId) || [];
    const waiting = entries.filter(e => e.status === 'waiting');
    const avgWaitTime = waiting.length > 0
      ? waiting.reduce((sum, e) => sum + e.estimatedWaitTime, 0) / waiting.length
      : 0;

    return {
      partnerId,
      partnerName: partnerId.charAt(0).toUpperCase() + partnerId.slice(1),
      currentWait: waiting.length,
      avgWaitTime: Math.round(avgWaitTime),
      partiesWaiting: waiting.length,
      tablesAvailable: 5 - waiting.filter(e => e.partySize <= 2).length,
    };
  }

  /**
   * Update estimated wait times
   */
  async updateWaitTimes(partnerId: string): Promise<void> {
    const entries = this.waitlists.get(partnerId) || [];
    const waiting = entries
      .filter(e => e.status === 'waiting')
      .sort((a, b) => a.position - b.position);

    for (let i = 0; i < waiting.length; i++) {
      const entry = waiting[i];
      entry.position = i + 1;
      entry.estimatedWaitTime = this.calculateWaitTime(entry.position, entry.partySize);
    }

    this.waitlists.set(partnerId, entries);
  }

  /**
   * Get customer waitlist history
   */
  async getCustomerHistory(customerId: string): Promise<{
    totalWaits: number;
    avgWaitTime: number;
    cancellations: number;
  }> {
    let totalWaits = 0;
    let totalWaitTime = 0;
    let cancellations = 0;

    for (const entries of this.waitlists.values()) {
      for (const entry of entries) {
        if (entry.customerId === customerId) {
          totalWaits++;
          if (entry.actualWaitTime) totalWaitTime += entry.actualWaitTime;
          if (entry.status === 'cancelled') cancellations++;
        }
      }
    }

    return {
      totalWaits,
      avgWaitTime: totalWaits > 0 ? totalWaitTime / totalWaits : 0,
      cancellations,
    };
  }

  /**
   * Notify next party
   */
  async notifyNextParty(partnerId: string): Promise<WaitlistEntry | null> {
    const entries = this.waitlists.get(partnerId) || [];
    const next = entries.find(e => e.status === 'waiting');
    
    if (next) {
      await this.markReady(next.id);
      return next;
    }
    return null;
  }
}