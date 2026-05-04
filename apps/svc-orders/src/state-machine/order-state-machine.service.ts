import { Injectable } from '@nestjs/common';
import { OrderStatus } from '../entities/order.entity';

// Valid state transitions
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PLACED]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  [OrderStatus.PREPARING]: [OrderStatus.DISPATCHED, OrderStatus.CANCELLED],
  [OrderStatus.DISPATCHED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

export interface TransitionResult {
  allowed: boolean;
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  error?: string;
}

@Injectable()
export class OrderStateMachine {
  canTransition(from: OrderStatus, to: OrderStatus): boolean {
    const allowed = TRANSITIONS[from] || [];
    return allowed.includes(to);
  }

  transition(orderId: string, from: OrderStatus, to: OrderStatus): TransitionResult {
    if (!this.canTransition(from, to)) {
      return {
        allowed: false,
        fromStatus: from,
        toStatus: to,
        error: `Invalid transition from ${from} to ${to}`,
      };
    }
    return {
      allowed: true,
      fromStatus: from,
      toStatus: to,
    };
  }

  getAllowedTransitions(status: OrderStatus): OrderStatus[] {
    return TRANSITIONS[status] || [];
  }

  isTerminal(status: OrderStatus): boolean {
    return status === OrderStatus.DELIVERED || status === OrderStatus.CANCELLED;
  }

  getStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      [OrderStatus.PLACED]: 'Order Placed',
      [OrderStatus.CONFIRMED]: 'Confirmed',
      [OrderStatus.PREPARING]: 'Preparing',
      [OrderStatus.DISPATCHED]: 'Out for Delivery',
      [OrderStatus.DELIVERED]: 'Delivered',
      [OrderStatus.CANCELLED]: 'Cancelled',
    };
    return labels[status];
  }

  getNextAction(status: OrderStatus): string | null {
    const actions: Record<OrderStatus, string | null> = {
      [OrderStatus.PLACED]: 'confirm',
      [OrderStatus.CONFIRMED]: 'start_preparing',
      [OrderStatus.PREPARING]: 'mark_dispatched',
      [OrderStatus.DISPATCHED]: 'confirm_delivery',
      [OrderStatus.DELIVERED]: null,
      [OrderStatus.CANCELLED]: null,
    };
    return actions[status];
  }
}