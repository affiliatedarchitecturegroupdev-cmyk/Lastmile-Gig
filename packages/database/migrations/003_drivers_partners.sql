-- Driver & Partner Schema
-- P013 - Drivers & Partners

-- Drivers
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id),
    
    vehicle_type VEHICLE_TYPE NOT NULL DEFAULT 'scooter',
    vehicle_plate VARCHAR(20),
    vehicle_licenseExpiry DATE,
    
    status DRIVER_STATUS NOT NULL DEFAULT 'offline',
    performance_score DECIMAL(5, 2) DEFAULT 0,
    total_deliveries INTEGER DEFAULT 0,
    acceptance_rate DECIMAL(5, 2) DEFAULT 0,
    
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    last_location_at TIMESTAMP WITH TIME ZONE,
    current_zone VARCHAR(50),
    
    bank_account JSONB,
    payout_preference PAYOUT_SCHEDULE DEFAULT 'daily',
    
    onboarding_completed BOOLEAN DEFAULT FALSE,
    documents_verified BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_drivers_user_id ON drivers(user_id);
CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_drivers_zone ON drivers(current_zone);

-- Driver Wallet
CREATE TABLE IF NOT EXISTS driver_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL UNIQUE REFERENCES drivers(id) ON DELETE CASCADE,
    current_balance DECIMAL(12, 2) DEFAULT 0,
    pending_balance DECIMAL(12, 2) DEFAULT 0,
    total_earned DECIMAL(12, 2) DEFAULT 0,
    total_paid DECIMAL(12, 2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Driver Transactions
CREATE TABLE IF NOT EXISTS driver_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL REFERENCES drivers(id),
    order_id UUID REFERENCES orders(id),
    type TRANSACTION_TYPE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    reference VARCHAR(255),
    description TEXT,
    status TRANSACTION_STATUS DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_driver_transactions_driver_id ON driver_transactions(driver_id);
CREATE INDEX idx_driver_transactions_order_id ON driver_transactions(order_id);

-- Partners (Restaurants)
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    type PARTNER_TYPE NOT NULL,
    
    status PARTNER_STATUS NOT NULL DEFAULT 'pending',
    approved_at TIMESTAMP WITH TIME ZONE,
    
    address JSONB NOT NULL,
    coordinates JSONB,
    
    cuisine_types VARCHAR(255)[],
    price_range SMALLINT DEFAULT 2,
    
    rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    
    operating_hours JSONB,
    delivery_zones JSONB,
    minimum_order DECIMAL(10, 2) DEFAULT 0,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    estimated_delivery_minutes INTEGER DEFAULT 45,
    sla_minutes INTEGER DEFAULT 45,
    
    commission_rate DECIMAL(5, 2) DEFAULT 0.15,
    
    bank_details JSONB,
    payout_schedule PAYOUT_SCHEDULE DEFAULT 'weekly',
    
    logo_url TEXT,
    cover_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_partners_slug ON partners(slug);
CREATE INDEX idx_partners_status ON partners(status);
CREATE INDEX idx_partners_type ON partners(type);

-- Partner Users (Staff)
CREATE TABLE IF NOT EXISTS partner_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID NOT NULL REFERENCES partners(id),
    user_id UUID NOT NULL REFERENCES users(id),
    role PARTNER_USER_ROLE NOT NULL DEFAULT 'staff',
    permissions JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_partner_users_user_partner ON partner_users(user_id, partner_id);

-- Enums
CREATE TYPE VEHICLE_TYPE AS ENUM ('scooter', 'bicycle', 'car', 'van');
CREATE TYPE DRIVER_STATUS AS ENUM ('active', 'idle', 'offline', 'suspended', 'busy');
CREATE TYPE PARTNER_TYPE AS ENUM ('restaurant', 'cafe', 'fastfood', 'finedining', 'hotel', 'corporate');
CREATE TYPE PARTNER_STATUS AS ENUM ('pending', 'active', 'suspended', 'inactive');
CREATE TYPE PARTNER_USER_ROLE AS ENUM ('owner', 'manager', 'staff');
CREATE TYPE PAYOUT_SCHEDULE AS ENUM ('daily', 'weekly', 'monthly');
CREATE TYPE TRANSACTION_TYPE AS ENUM ('earning', 'payout', 'bonus', 'penalty', 'refund');
CREATE TYPE TRANSACTION_STATUS AS ENUM ('pending', 'completed', 'failed');

-- Triggers
CREATE TRIGGER update_drivers_updated_at 
    BEFORE UPDATE ON drivers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partners_updated_at 
    BEFORE UPDATE ON partners 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();