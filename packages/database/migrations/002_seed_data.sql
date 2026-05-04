-- Seed test data for development

-- Insert test customer
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, status, email_verified_at) 
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'customer@lastmile-gig.com',
    '$2a$10$abcdefghijklmnopqrstuvwxyz',
    'Test',
    'Customer',
    '+27871234567',
    'customer',
    'active',
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

-- Insert test partner
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, status, email_verified_at) 
VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'partner@lastmile-gig.com',
    '$2a$10$abcdefghijklmnopqrstuvwxyz',
    'Test',
    'Partner',
    '+27871234568',
    'partner',
    'active',
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

-- Insert test driver
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, status, email_verified_at) 
VALUES (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'driver@lastmile-gig.com',
    '$2a$10$abcdefghijklmnopqrstuvwxyz',
    'Test',
    'Driver',
    '+27871234569',
    'driver',
    'active',
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

-- Insert test partner organization
INSERT INTO partners (id, user_id, name, slug, type, status, phone, email, address, delivery_fee, minimum_order, sla_minutes, rating)
VALUES (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Test Restaurant',
    'test-restaurant',
    'restaurant',
    'active',
    '+27871234568',
    'partner@lastmile-gig.com',
    '123 Test Street, Johannesburg, 2001',
    35.00,
    100.00,
    45,
    4.5
) ON CONFLICT (slug) DO NOTHING;

-- Insert test driver profile
INSERT INTO drivers (id, user_id, first_name, last_name, email, phone, status, vehicle_type, rating, total_deliveries)
VALUES (
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'John',
    'Driver',
    'driver@lastmile-gig.com',
    '+27871234569',
    'active',
    'motorcycle',
    4.8,
    150
) ON CONFLICT (email) DO NOTHING;

-- Insert sample partner operating hours
INSERT INTO operating_hours (partner_id, day_of_week, is_open, open_time, close_time)
SELECT 
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    day,
    is_open,
    open_time,
    close_time
FROM (VALUES 
    (0, false, null, null),
    (1, true, '09:00', '22:00'),
    (2, true, '09:00', '22:00'),
    (3, true, '09:00', '22:00'),
    (4, true, '09:00', '22:00'),
    (5, true, '09:00', '23:00'),
    (6, true, '09:00', '23:00')
) AS t(day, is_open, open_time, close_time)
ON CONFLICT DO NOTHING;