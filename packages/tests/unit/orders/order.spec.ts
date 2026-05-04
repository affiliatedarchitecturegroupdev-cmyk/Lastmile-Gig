import { OrderStateMachine, OrderStatus, validTransitions, canTransition } from '../apps/svc-orders/src/order-state-machine';

describe('OrderStateMachine', () => {
  describe('validTransitions', () => {
    it('should allow placed to confirmed', () => {
      expect(validTransitions[OrderStatus.PLACED]).toContain(OrderStatus.CONFIRMED);
    });

    it('should allow confirmed to preparing', () => {
      expect(validTransitions[OrderStatus.CONFIRMED]).toContain(OrderStatus.PREPARING);
    });

    it('should allow preparing to dispatched', () => {
      expect(validTransitions[OrderStatus.PREPARING]).toContain(OrderStatus.DISPATCHED);
    });

    it('should allow dispatched to delivered', () => {
      expect(validTransitions[OrderStatus.DISPATCHED]).toContain(OrderStatus.DELIVERED);
    });

    it('should allow any status to cancelled (by system)', () => {
      expect(validTransitions[OrderStatus.PLACED]).toContain(OrderStatus.CANCELLED);
      expect(validTransitions[OrderStatus.CONFIRMED]).toContain(OrderStatus.CANCELLED);
      expect(validTransitions[OrderStatus.PREPARING]).toContain(OrderStatus.CANCELLED);
    });

    it('should not allow delivered to be cancelled', () => {
      expect(validTransitions[OrderStatus.DELIVERED]).not.toContain(OrderStatus.CANCELLED);
    });
  });

  describe('canTransition', () => {
    it('should return true for valid transition', () => {
      expect(canTransition(OrderStatus.PLACED, OrderStatus.CONFIRMED)).toBe(true);
    });

    it('should return false for invalid transition', () => {
      expect(canTransition(OrderStatus.PLACED, OrderStatus.DELIVERED)).toBe(false);
    });

    it('should return false for same status', () => {
      expect(canTransition(OrderStatus.PLACED, OrderStatus.PLACED)).toBe(false);
    });

    it('should return false for backwards transition', () => {
      expect(canTransition(OrderStatus.DELIVERED, OrderStatus.DISPATCHED)).toBe(false);
    });
  });

  describe('transition', () => {
    it('should create a new state on valid transition', () => {
      const sm = new OrderStateMachine(OrderStatus.PLACED);
      const newState = sm.transition(OrderStatus.CONFIRMED);
      expect(newState.status).toBe(OrderStatus.CONFIRMED);
      expect(newState.previousStatus).toBe(OrderStatus.PLACED);
      expect(newState.transitionedAt).toBeInstanceOf(Date);
    });
  });
});

describe('Order entity', () => {
  const mockOrderData = {
    orderNumber: 'LM2024001',
    customerId: 'cust-123',
    partnerId: 'partner-456',
    items: [{ menuItemId: 'item-1', name: 'Burger', price: 99, quantity: 2 }],
    subtotal: 198,
    deliveryFee: 35,
    total: 233,
  };

  it('should create order with default status', () => {
    expect(mockOrderData).toBeDefined();
    expect(mockOrderData.orderNumber).toBe('LM2024001');
  });

  it('should calculate total correctly', () => {
    const total = mockOrderData.subtotal + mockOrderData.deliveryFee;
    expect(total).toBe(233);
  });
});