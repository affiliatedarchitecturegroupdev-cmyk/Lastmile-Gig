import { Test, TestingModule } from '@nestjs/testing';
import { CustomerProfileService, Customer } from '../apps/svc-customer-profile/src/customer-profile.service';

describe('CustomerProfileService', () => {
  let service: CustomerProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomerProfileService],
    }).compile();

    service = module.get<CustomerProfileService>(CustomerProfileService);
  });

  describe('createCustomer', () => {
    it('should create a new customer', async () => {
      const customer = await service.createCustomer({
        email: 'test@example.com',
        phone: '+27811234567',
        firstName: 'Test',
        lastName: 'User',
      });

      expect(customer).toBeDefined();
      expect(customer.email).toBe('test@example.com');
      expect(customer.status).toBe('active');
      expect(customer.tier).toBe('bronze');
    });
  });

  describe('updatePreferences', () => {
    it('should update notification preferences', async () => {
      const result = await service.updatePreferences('c1', {
        notifications: { orderUpdates: false, promotions: true, newPartners: false, newsletters: false },
      });

      expect(result).toBe(true);
    });
  });

  describe('addFavorite', () => {
    it('should add restaurant to favorites', async () => {
      const result = await service.addFavorite('c1', 'p1');
      expect(result).toBe(true);
    });
  });

  describe('suspendCustomer', () => {
    it('should suspend customer account', async () => {
      const result = await service.suspendCustomer('c1', 'Policy violation');
      expect(result).toBe(true);
    });
  });
});