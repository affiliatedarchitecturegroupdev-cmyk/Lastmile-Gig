// Test setup
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.NODE_ENV = 'test';

afterAll(() => {
  delete process.env.JWT_SECRET;
  delete process.env.NODE_ENV;
});