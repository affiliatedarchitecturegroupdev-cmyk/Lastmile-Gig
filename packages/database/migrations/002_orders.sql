-- Orders Schema
-- P012 - Core Orders

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(20) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES users(id),
    partner_id UUID NOT NULL,
    driver_id UUID REFERENCES users(id),
    status ORDER_STATUS NOT NULL DEFAULT 'placed',
    
    items JSONB NOT NULL DEFAULT '[]',
    subtotal DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    service_fee DECIMAL(10, 2) DEFAULT 0,
    tip DECIMAL(10, 2) DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    
    payment_method PAYMENT_METHOD,
    payment_ref VARCHAR(255),
    payment_status PAYMENT_STATUS DEFAULT 'pending',
    
    delivery_address JSONB NOT NULL,
    delivery_instructions TEXT,
    
    estimated_pickup_time TIMESTAMP WITH TIME ZONE,
    estimated_delivery_time TIMESTAMP WITH TIME ZONE,
    actual_pickup_time TIMESTAMP WITH TIME ZONE,
    actual_delivery_time TIMESTAMP WITH TIME ZONE,
    
    placed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    preparing_at TIMESTAMP WITH TIME ZONE,
    dispatched_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancel_reason TEXT,
    
    customer_rating SMALLINT,
    customer_feedback TEXT,
    driver_rating SMALLINT,
    
    partner_commission DECIMAL(10, 2),
    driver_earnings DECIMAL(10, 2),
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_partner_id ON orders(partner_id);
CREATE INDEX idx_orders_driver_id ON orders(driver_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_partner_id_status ON orders(partner_id, status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Order Status History
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status ORDER_STATUS NOT NULL,
    note TEXT,
    actor_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);

-- Enums
CREATE TYPE ORDER_STATUS AS ENUM (
    'placed', 'confirmed', 'preparing', 'ready', 
    'dispatched', 'delivered', 'cancelled'
);

CREATE TYPE PAYMENT_METHOD AS ENUM ('card', 'apple_pay', 'google_pay', 'cash', 'ozow', 'paystack');
CREATE TYPE PAYMENT_STATUS AS ENUM ('pending', 'authorized', 'captured', 'failed', 'refunded');

-- SLA breach tracking
CREATE TABLE IF NOT EXISTS order_sla_breaches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id),
    breach_type VARCHAR(50) NOT NULL,
    sla_minutes INTEGER NOT NULL,
    actual_minutes INTEGER NOT NULL,
    penalty_amount DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_sla_breaches_order_id ON order_sla_breaches(order_id);

-- Trigger
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();