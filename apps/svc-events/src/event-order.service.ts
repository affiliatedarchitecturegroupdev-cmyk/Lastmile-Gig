import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export type EventType = 'party' | 'corporate' | 'wedding' | 'birthday' | 'sports' | 'conference' | 'gathering';
export type EventStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface EventOrder {
  id: string;
  userId: string;
  eventType: EventType;
  eventName: string;
  date: Date;
  time: string;
  location: string;
  guestCount: number;
  status: EventStatus;
  catering: boolean;
  items: { itemId: string; quantity: number }[];
  notes?: string;
  reminderSent: boolean;
  createdAt: Date;
}

@Injectable()
export class EventOrderService {
  private events: Map<string, EventOrder> = new Map();

  /**
   * Create event order
   */
  async createEvent(data: {
    userId: string;
    eventType: EventType;
    eventName: string;
    date: Date;
    time: string;
    location: string;
    guestCount: number;
    catering?: boolean;
    items?: { itemId: string; quantity: number }[];
    notes?: string;
  }): Promise<EventOrder> {
    const event: EventOrder = {
      id: uuidv4(),
      userId: data.userId,
      eventType: data.eventType,
      eventName: data.eventName,
      date: data.date,
      time: data.time,
      location: data.location,
      guestCount: data.guestCount,
      status: 'scheduled',
      catering: data.catering || false,
      items: data.items || [],
      notes: data.notes,
      reminderSent: false,
      createdAt: new Date(),
    };

    this.events.set(event.id, event);
    return event;
  }

  /**
   * Get user events
   */
  async getUserEvents(userId: string): Promise<EventOrder[]> {
    return Array.from(this.events.values())
      .filter(e => e.userId === userId)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(): Promise<EventOrder[]> {
    const now = new Date();
    return Array.from(this.events.values())
      .filter(e => e.date > now && e.status === 'scheduled')
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Update event status
   */
  async updateStatus(eventId: string, status: EventStatus): Promise<boolean> {
    const event = this.events.get(eventId);
    if (!event) return false;
    
    event.status = status;
    this.events.set(eventId, event);
    return true;
  }

  /**
   * Get events by type
   */
  async getEventsByType(eventType: EventType): Promise<EventOrder[]> {
    return Array.from(this.events.values())
      .filter(e => e.eventType === eventType);
  }

  /**
   * Set catering for event
   */
  async setCatering(eventId: string, catering: boolean, items: { itemId: string; quantity: number }[]): Promise<boolean> {
    const event = this.events.get(eventId);
    if (!event) return false;
    
    event.catering = catering;
    event.items = items;
    this.events.set(eventId, event);
    return true;
  }

  /**
   * Get events for date
   */
  async getEventsForDate(date: Date): Promise<EventOrder[]> {
    const dateStr = date.toDateString();
    return Array.from(this.events.values())
      .filter(e => e.date.toDateString() === dateStr);
  }

  /**
   * Send reminder
   */
  async sendReminder(eventId: string): Promise<boolean> {
    const event = this.events.get(eventId);
    if (!event) return false;
    
    event.reminderSent = true;
    this.events.set(eventId, event);
    return true;
  }

  /**
   * Get events needing reminders
   */
  async getEventsForReminder(): Promise<EventOrder[]> {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return Array.from(this.events.values())
      .filter(e => 
        e.status === 'scheduled' &&
        !e.reminderSent &&
        e.date.toDateString() === tomorrow.toDateString()
      );
  }

  /**
   * Get catering orders
   */
  async getCateringOrders(): Promise<EventOrder[]> {
    return Array.from(this.events.values())
      .filter(e => e.catering && e.status === 'scheduled');
  }

  /**
   * Get event by ID
   */
  async getEvent(eventId: string): Promise<EventOrder | null> {
    return this.events.get(eventId) || null;
  }

  /**
   * Get recommended items
   */
  async getRecommendedItems(guestCount: number, eventType: EventType): Promise<{ itemId: string; name: string; recommended: number }[]> {
    const recommendations = [
      { itemId: 'main1', name: 'Party Platter', recommended: Math.ceil(guestCount / 10) },
      { itemId: 'side1', name: 'Sides Pack', recommended: Math.ceil(guestCount / 8) },
      { itemId: 'drink1', name: 'Beverage Bundle', recommended: Math.ceil(guestCount / 5) },
      { itemId: 'dessert1', name: 'Dessert Tray', recommended: Math.ceil(guestCount / 12) },
    ];

    return recommendations;
  }

  /**
   * Get event summary
   */
  async getEventSummary(): Promise<{
    totalEvents: number;
    upcoming: number;
    catering: number;
    byType: Record<EventType, number>;
  }> {
    const events = Array.from(this.events.values());
    const upcoming = events.filter(e => e.status === 'scheduled').length;
    const catering = events.filter(e => e.catering).length;
    
    const byType: Record<EventType, number> = {
      party: 0, corporate: 0, wedding: 0, birthday: 0, sports: 0, conference: 0, gathering: 0,
    };

    for (const event of events) {
      byType[event.eventType]++;
    }

    return {
      totalEvents: events.length,
      upcoming,
      catering,
      byType,
    };
  }
}