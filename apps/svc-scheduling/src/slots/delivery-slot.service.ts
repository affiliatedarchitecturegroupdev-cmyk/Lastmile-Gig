import { Injectable } from '@nestjs/common';

export type SlotStatus = 'available' | 'limited' | 'full' | 'closed';
export type SlotDuration = 30 | 60 | 90 | 120;

export interface TimeSlot {
  id: string;
  zoneId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;
  maxOrders: number;
  currentOrders: number;
  status: SlotStatus;
  capacityPercent: number;
  fee: number; // R - delivery fee for this slot
}

export interface DeliverySchedule {
  slotId: string;
  orderId: string;
  customerId: string;
  partnerId: string;
  estimatedArrival: string;
  scheduled: boolean;
  notes?: string;
}

@Injectable()
export class DeliverySlotService {
  private slots: Map<string, TimeSlot[]> = new Map();
  private schedules: Map<string, DeliverySchedule> = new Map();

  /**
   * Get available slots for a zone and date
   */
  async getAvailableSlots(
    zoneId: string,
    date: string
  ): Promise<TimeSlot[]> {
    const key = `${zoneId}_${date}`;
    return this.slots.get(key) || this.generateDefaultSlots(zoneId, date);
  }

  /**
   * Generate default time slots
   */
  private generateDefaultSlots(zoneId: string, date: string): TimeSlot[] {
    const slotConfigs = [
      { start: '08:00', end: '09:00', max: 15, fee: 25 },
      { start: '09:00', end: '10:00', max: 20, fee: 20 },
      { start: '10:00', end: '11:00', max: 25, fee: 15 },
      { start: '11:00', end: '12:00', max: 30, fee: 15 },
      { start: '12:00', end: '13:00', max: 35, fee: 20 },
      { start: '13:00', end: '14:00', max: 35, fee: 20 },
      { start: '14:00', end: '15:00', max: 30, fee: 15 },
      { start: '15:00', end: '16:00', max: 25, fee: 15 },
      { start: '16:00', end: '17:00', max: 30, fee: 20 },
      { start: '17:00', end: '18:00', max: 40, fee: 25 },
      { start: '18:00', end: '19:00', max: 45, fee: 30 },
      { start: '19:00', end: '20:00', max: 40, fee: 30 },
      { start: '20:00', end: '21:00', max: 30, fee: 25 },
      { start: '21:00', end: '22:00', max: 20, fee: 35 },
    ];

    return slotConfigs.map((config, i) => {
      const currentOrders = Math.floor(Math.random() * config.max);
      const capacityPercent = (currentOrders / config.max) * 100;
      
      let status: SlotStatus = 'available';
      if (capacityPercent >= 90) status = 'full';
      else if (capacityPercent >= 70) status = 'limited';

      return {
        id: `slot_${zoneId}_${date}_${i}`,
        zoneId,
        date,
        startTime: config.start,
        endTime: config.end,
        maxOrders: config.max,
        currentOrders,
        status,
        capacityPercent,
        fee: config.fee,
      };
    });
  }

  /**
   * Book a delivery slot
   */
  async bookSlot(data: {
    slotId: string;
    orderId: string;
    customerId: string;
    partnerId: string;
    notes?: string;
  }): Promise<DeliverySchedule> {
    const slot = await this.getSlotById(data.slotId);
    
    if (!slot || slot.status === 'full') {
      throw new Error('Slot not available');
    }

    const scheduledTime = new Date(`${slot.date}T${slot.startTime}:00`);
    const estimatedArrival = new Date(scheduledTime.getTime() + 45 * 60000).toISOString();

    const schedule: DeliverySchedule = {
      slotId: data.slotId,
      orderId: data.orderId,
      customerId: data.customerId,
      partnerId: data.partnerId,
      estimatedArrival,
      scheduled: true,
      notes: data.notes,
    };

    this.schedules.set(data.orderId, schedule);

    // Increment slot capacity
    slot.currentOrders++;
    slot.capacityPercent = (slot.currentOrders / slot.maxOrders) * 100;
    if (slot.capacityPercent >= 90) slot.status = 'full';
    else if (slot.capacityPercent >= 70) slot.status = 'limited';

    return schedule;
  }

  /**
   * Get slot by ID
   */
  async getSlotById(slotId: string): Promise<TimeSlot | null> {
    // Would search slots map
    return null;
  }

  /**
   * Get order schedule
   */
  async getOrderSchedule(orderId: string): Promise<DeliverySchedule | null> {
    return this.schedules.get(orderId) || null;
  }

  /**
   * Cancel slot booking
   */
  async cancelBooking(orderId: string): Promise<boolean> {
    const schedule = this.schedules.get(orderId);
    if (!schedule) return false;

    this.schedules.delete(orderId);
    return true;
  }

  /**
   * Get popular time slots
   */
  async getPopularSlots(zoneId: string, date: string): Promise<string[]> {
    const slots = await this.getAvailableSlots(zoneId, date);
    return slots
      .filter(s => s.capacityPercent > 50)
      .map(s => s.startTime);
  }

  /**
   * Get next available slot
   */
  async getNextAvailable(zoneId: string): Promise<TimeSlot | null> {
    const today = new Date().toISOString().split('T')[0];
    const slots = await this.getAvailableSlots(zoneId, today);
    
    return slots.find(s => s.status !== 'full') || null;
  }

  /**
   * Calculate slot fee based on demand
   */
  calculateSlotFee(baseFee: number, slot: TimeSlot): number {
    if (slot.status === 'full') return baseFee + 50;
    if (slot.status === 'limited') return baseFee + 15;
    return baseFee;
  }
}