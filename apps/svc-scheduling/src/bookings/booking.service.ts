import { Injectable } from '@nestjs/common';

export type BookingType = 'preorder' | 'scheduled' | 'asap';

export interface Booking {
  id: string;
  orderId: string;
  customerId: string;
  zoneId: string;
  partnerId: string;
  type: BookingType;
  requestedDate: string;
  requestedTime?: string;
  preferredTime?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'completed' | 'cancelled';
  createdAt: Date;
  confirmedAt?: Date;
}

@Injectable()
export class BookingService {
  private bookings: Map<string, Booking> = new Map();

  /**
   * Create a pre-order booking
   */
  async createPreorder(data: {
    orderId: string;
    customerId: string;
    zoneId: string;
    partnerId: string;
    requestedDate: string;
    requestedTime: string;
  }): Promise<Booking> {
    const booking: Booking = {
      id: `booking_${data.orderId}`,
      orderId: data.orderId,
      customerId: data.customerId,
      zoneId: data.zoneId,
      partnerId: data.partnerId,
      type: 'preorder',
      requestedDate: data.requestedDate,
      requestedTime: data.requestedTime,
      preferredTime: data.requestedTime,
      status: 'pending',
      createdAt: new Date(),
    };

    this.bookings.set(booking.id, booking);
    return booking;
  }

  /**
   * Create ASAP booking
   */
  async createASAP(data: {
    orderId: string;
    customerId: string;
    zoneId: string;
    partnerId: string;
  }): Promise<Booking> {
    const booking: Booking = {
      id: `booking_${data.orderId}`,
      orderId: data.orderId,
      customerId: data.customerId,
      zoneId: data.zoneId,
      partnerId: data.partnerId,
      type: 'asap',
      requestedDate: new Date().toISOString().split('T')[0],
      status: 'confirmed',
      createdAt: new Date(),
      confirmedAt: new Date(),
    };

    this.bookings.set(booking.id, booking);
    return booking;
  }

  /**
   * Confirm booking
   */
  async confirmBooking(bookingId: string): Promise<Booking | null> {
    const booking = this.bookings.get(bookingId);
    if (booking) {
      booking.status = 'confirmed';
      booking.confirmedAt = new Date();
      this.bookings.set(bookingId, booking);
    }
    return booking || null;
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId: string): Promise<boolean> {
    const booking = this.bookings.get(bookingId);
    if (booking) {
      booking.status = 'cancelled';
      this.bookings.set(bookingId, booking);
      return true;
    }
    return false;
  }

  /**
   * Get booking by order
   */
  async getBookingByOrder(orderId: string): Promise<Booking | null> {
    for (const booking of this.bookings.values()) {
      if (booking.orderId === orderId) return booking;
    }
    return null;
  }

  /**
   * Get customer bookings
   */
  async getCustomerBookings(customerId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values())
      .filter(b => b.customerId === customerId);
  }

  /**
   * Get upcoming bookings for partner
   */
  async getPartnerBookings(partnerId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values())
      .filter(b => b.partnerId === partnerId && b.status !== 'cancelled');
  }

  /**
   * Check slot availability
   */
  async checkAvailability(
    zoneId: string,
    date: string,
    time: string
  ): Promise<{ available: boolean; remaining: number }> {
    // Would check slot capacity
    return { available: true, remaining: 15 };
  }

  /**
   * Get booking history
   */
  async getBookingHistory(
    customerId: string,
    limit: number = 10
  ): Promise<Booking[]> {
    const bookings = await this.getCustomerBookings(customerId);
    return bookings.slice(-limit).reverse();
  }
}