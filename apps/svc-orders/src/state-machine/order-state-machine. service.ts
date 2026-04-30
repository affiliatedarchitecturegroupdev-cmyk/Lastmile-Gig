import { Injectable } from '@nestjs/common';

// Order State Machine - FSM for Order Lifecycle
type OrderStatus = 'placed' | 'confirmed' | 'preparing' | 'ready' | 'dispatched' | 'delivered' | 'cancelled';

interface Transition {
  from: OrderStatus;
  to: OrderStatus;
  action: string;
}

@Injectable()
export class OrderStateMachine {
  private transitions: Transition[] = [
    { from: 'placed', to: 'confirmed', action: 'CONFIRM' },
    { from: 'confirmed', to: 'preparing', action: 'START_PREPARING' },
    { from: 'preparing', to: 'ready', action: 'MARK_READY' },
    { from: 'ready', to: 'dispatched', action: 'DISPATCH' },
    { from: 'dispatched', to: 'delivered', action: 'DELIVER' },
    { from: 'placed', to: 'cancelled', action: 'CANCEL' },
    { from: 'confirmed', to: 'cancelled', action: 'CANCEL' },
  ];

  // Valid statuses for order lifecycle
  private validStatuses: OrderStatus[] = [
    'placed', 'confirmed', 'preparing', 'ready', 'dispatched', 'delivered', 'cancelled',
  ];

  // SLA thresholds in minutes
  private slaThresholds: Record<string, number> = {
    confirm: 5,      // Partner should confirm within 5 min
    prepare: 20,       // Should start preparing within 20 min
    ready: 35,         // Should be ready within 35 min
    dispatch: 5,        // Driver should pick up within 5 min
    deliver: 45,       // Should deliver within 45 min from dispatch
  };

  canTransition(from: OrderStatus, to: OrderStatus): boolean {
    return this.transitions.some(t => t.from === from && t.to === to);
  }

  getNextStatuses(current: OrderStatus): OrderStatus[] {
    return this.transitions
      .filter(t => t.from === current)
      .map(t => t.to);
  }

  getValidStatuses(): OrderStatus[] {
    return this.validStatuses;
  }

  getSlaThreshold(stage: string): number {
    return this.slaThresholds[stage] || 0;
  }

  isFinalStatus(status: OrderStatus): boolean {
    return status === 'delivered' || status === 'cancelled';
  }

  isActiveStatus(status: OrderStatus): boolean {
    return !this.isFinalStatus(status);
  }

  getAction(from: OrderStatus, to: OrderStatus): string | undefined {
    const transition = this.transitions.find(t => t.from === from && t.to === to);
    return transition?.action;
  }
}