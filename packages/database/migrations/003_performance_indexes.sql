-- Migration: Add indexes for performance
-- Run after initial schema is created

-- Add composite indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_partner_status ON orders(partner_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_customer_status ON orders(customer_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_driver_status ON orders(driver_id, status);

-- Add partial indexes for active records
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_active ON orders(created_at) WHERE status IN ('placed', 'confirmed', 'preparing', 'dispatched');
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_drivers_online ON drivers(user_id) WHERE status = 'active' AND availability = 'online';

-- Add index for delivery zone queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_partners_zone_status ON partners(zone, status) WHERE status = 'active';

-- Add function for updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_partners_updated_at ON partners;
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_drivers_updated_at ON drivers;
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable row-level security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS users_select ON users;
CREATE POLICY users_select ON users FOR SELECT USING (true);

DROP POLICY IF EXISTS partners_select ON partners;
CREATE POLICY partners_select ON partners FOR SELECT USING (true);

DROP POLICY IF EXISTS drivers_select ON drivers;
CREATE POLICY drivers_select ON drivers FOR SELECT USING (true);

DROP POLICY IF EXISTS orders_select ON orders;
CREATE POLICY orders_select ON orders FOR SELECT USING (true);