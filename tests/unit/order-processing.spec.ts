import { Test, TestingModule } from '@nestjs/testing';
import { OrderProcessingService, Order } from './order-processing.service';

describe('OrderProcessingService', () => {
  let service: OrderProcessingService;
  let mockOrder: Order;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderProcessingService],
    }).compile();

    service = module.get<OrderProcessingService>(OrderProcessingService);
  });

  beforeEach(() => {
    mockOrder = {
      id: 'ord_123',
      userId: 'user_1',
      restaurantId: 'rest_1',
      items: [{
        id: 'item_1',
        menuItemId: ' menu_1',
        name: 'Burger',
        quantity: 2,
        price: 120,
        modifiers: [],
        subtotal: 240,
      }],
      status: 'pending',
      subtotal: 240,
      deliveryFee: 35,
      serviceFee: 12,
      discount: 0,
      tip: 20,
      total: 307,
      paymentMethod: 'card',
      paymentStatus: 'pending',
      deliveryAddress: {
        street: '123 Main St',
        city: 'Johannesburg',
        province: 'Gauteng',
        zipCode: '2001',
        lat: -26.2041,
        lng: 28.0473,
      },
      estimatedDeliveryTime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  describe('createOrder', () => {
    it('should create an order with calculated totals', async () => {
      const order = await service.createOrder({
        userId: 'user_1',
        restaurantId: 'rest_1',
        items: [{ menuItemId: 'menu_1', name: 'Burger', quantity: 2, price: 120 }],
        deliveryAddress: mockOrder.deliveryAddress,
        paymentMethod: 'card',
      });

      expect(order).toBeDefined();
      expect(order.id).toBeDefined();
      expect(order.total).toBeGreaterThan(0);
    });

    it('should apply tip when provided', async () => {
      const order = await service.createOrder({
        userId: 'user_1',
        restaurantId: 'rest_1',
        items: [{ menuItemId: 'menu_1', name: 'Burger', quantity: 1, price: 100 }],
        deliveryAddress: mockOrder.deliveryAddress,
        paymentMethod: 'card',
        tip: 50,
      });

      expect(order.tip).toBe(50);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update status from pending to confirmed', async () => {
      const result = await service.updateOrderStatus('ord_123', 'confirmed');
      expect(result.success).toBe(true);
    });

    it('should reject invalid status transition', async () => {
      await expect(service.updateOrderStatus('ord_123', 'delivered')).rejects.toThrow();
    });
  });

  describe('getOrders', () => {
    it('should filter orders by status', async () => {
      const result = await service.getOrders({ status: ['pending'] });
      expect(result.orders).toBeDefined();
    });

    it('should filter by restaurant', async () => {
      const result = await service.getOrders({ restaurantId: 'rest_1' });
      expect(result.orders).toBeDefined();
    });
  });
});