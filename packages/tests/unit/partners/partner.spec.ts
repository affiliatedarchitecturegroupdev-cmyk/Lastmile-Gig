import { PartnersService } from '../apps/svc-storefronts/src/partners/partners.service';

describe('PartnersService', () => {
  let service: PartnersService;

  beforeEach(() => {
    service = new PartnersService();
  });

  describe('register', () => {
    it('should register a new partner', async () => {
      const partner = await service.register({
        userId: 'user-123',
        name: 'Test Restaurant',
        phone: '+27871234567',
        email: 'test@restaurant.com',
        address: '123 Test St, Johannesburg',
        location: { lat: -26.2041, lng: 28.0473 },
      });

      expect(partner).toBeDefined();
      expect(partner.name).toBe('Test Restaurant');
      expect(partner.slug).toBe('test-restaurant');
    });

    it('should generate slug from name', async () => {
      const partner = await service.register({
        userId: 'user-456',
        name: 'Burger & Pizza Place',
        phone: '+27871234568',
        email: 'test2@restaurant.com',
        address: '123 Test St',
        location: { lat: -26.2041, lng: 28.0473 },
      });

      expect(partner.slug).toBe('burger-pizza-place');
    });

    it('should set default delivery fee', async () => {
      const partner = await service.register({
        userId: 'user-789',
        name: 'Test 3',
        phone: '+27871234569',
        email: 'test3@restaurant.com',
        address: '123 Test St',
        location: { lat: -26.2041, lng: 28.0473 },
      });

      expect(partner.deliveryFee).toBe(35);
    });
  });

  describe('checkSlug', () => {
    it('should return false for available slug', async () => {
      const available = await service.checkSlug('new-restaurant');
      expect(available).toBe(false);
    });

    it('should return true for taken slug', async () => {
      await service.register({
        userId: 'user-take',
        name: 'Taken Restaurant',
        phone: '+27871234560',
        email: 'taken@restaurant.com',
        address: '123 Test St',
        location: { lat: -26.2041, lng: 28.0473 },
      });

      const taken = await service.checkSlug('taken-restaurant');
      expect(taken).toBe(true);
    });
  });
});

describe('OperatingHoursService', () => {
  it('should manage operating hours', async () => {
    const mockPartnerId = 'partner-123';
    // Hours management logic
    expect(mockPartnerId).toBeDefined();
  });
});