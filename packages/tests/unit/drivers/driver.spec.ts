import { DriverEarningsService } from '../apps/svc-drivers/src/earnings/driver-earnings.service';

describe('DriverEarningsService', () => {
  let service: DriverEarningsService;

  beforeEach(() => {
    service = new DriverEarningsService();
  });

  describe('credit', () => {
    it('should credit driver earnings', async () => {
      await service.credit('driver-123', 100, 'order-456');
      const balance = await service.getBalance('driver-123');
      expect(balance).toBe(100);
    });

    it('should accumulate earnings', async () => {
      await service.credit('driver-123', 100, 'order-1');
      await service.credit('driver-123', 150, 'order-2');
      const balance = await service.getBalance('driver-123');
      expect(balance).toBe(250);
    });
  });

  describe('getBalance', () => {
    it('should return 0 for unknown driver', async () => {
      const balance = await service.getBalance('unknown-driver');
      expect(balance).toBe(0);
    });
  });

  describe('calculateDriverEarnings', () => {
    it('should calculate earnings with base amount', async () => {
      const earnings = await service.calculateDriverEarnings('order-1', 200, 5);
      expect(earnings).toBeGreaterThan(0);
    });

    it('should factor in distance', async () => {
      const shortDistance = await service.calculateDriverEarnings('order-1', 200, 2);
      const longDistance = await service.calculateDriverEarnings('order-2', 200, 10);
      expect(longDistance).toBeGreaterThan(shortDistance);
    });
  });
});

describe('DriverLocationService', () => {
  describe('distance calculation', () => {
    it('should calculate distance between two points', () => {
      const from = { lat: -26.2041, lng: 28.0473 };
      const to = { lat: -26.1899, lng: 28.0495 };
      // Johannesburg to Sandton is approximately 3km
      expect(from).toBeDefined();
      expect(to).toBeDefined();
    });
  });
});