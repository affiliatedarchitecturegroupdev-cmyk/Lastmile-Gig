# Phase Group D — Database Schemas (P071-P090)

## P071 — Supabase Project Configuration
```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "timescaledb";
CREATE EXTENSION IF NOT EXISTS "vector";
```

## P072 — Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role user_role NOT NULL,
  auth0_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  popia_consent BOOLEAN DEFAULT FALSE,
  popia_consent_at TIMESTAMPTZ
);

CREATE TYPE user_role AS ENUM (
  'customer', 'driver', 'partner', 'admin', 'ops'
);
```

## P073 — Drivers Table
```sql
CREATE TABLE drivers (
  id UUID PRIMARY KEY REFERENCES users(id),
  licence_number TEXT,
  licence_expiry DATE,
  biometric_ref TEXT,
  vehicle_type vehicle_type,
  status driver_status DEFAULT 'offline',
  performance_score DECIMAL(5,2),
  zone TEXT,
  wallet_address TEXT,
  onboarded_at TIMESTAMPTZ,
  insurance_tier TEXT
);

CREATE TYPE vehicle_type AS ENUM ('scooter', 'bicycle', 'car', 'van');
CREATE TYPE driver_status AS ENUM ('active', 'idle', 'offline', 'suspended');
```

## P074 — Partners/Restaurants Table
```sql
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type partner_type,
  cipc_number TEXT,
  vat_number TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address JSONB,
  bank_details JSONB,
  status TEXT DEFAULT 'pending',
  sla_contract_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE partner_type AS ENUM (
  'restaurant', 'cafe', 'fastfood', 'finedining', 'hotel', 'corporate', 'enterprise'
);
```

## P075 — Orders Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES users(id),
  partner_id UUID REFERENCES partners(id),
  driver_id UUID REFERENCES drivers(id),
  status order_status,
  items JSONB,
  subtotal DECIMAL(10,2),
  delivery_fee DECIMAL(10,2),
  total DECIMAL(10,2),
  payment_method TEXT,
  payment_ref TEXT,
  delivery_address JSONB,
  placed_at TIMESTAMPTZ DEFAULT NOW(),
  dispatched_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  delivery_photo_hash TEXT,
  blockchain_tx TEXT,
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT
);

CREATE TYPE order_status AS ENUM (
  'placed', 'confirmed', 'dispatched', 'delivered', 'cancelled'
);
```

## P076 — Vehicles/Fleet Table
```sql
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration TEXT UNIQUE,
  type vehicle_type,
  make TEXT,
  model TEXT,
  year INTEGER,
  is_ev BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'available',
  current_driver_id UUID REFERENCES drivers(id),
  odometer_km DECIMAL(10,2),
  last_service_date DATE,
  next_service_km DECIMAL(10,2),
  iot_device_id TEXT
);
```

## P077 — Payments Table
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'ZAR',
  gateway TEXT,
  gateway_ref TEXT,
  status TEXT,
  payout_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

## P078 — SLA Contracts Table
```sql
CREATE TABLE sla_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id),
  delivery_target_minutes INTEGER,
  breach_penalty_zar DECIMAL(10,2),
  perfect_week_bonus_zar DECIMAL(10,2),
  contract_start DATE,
  contract_end DATE,
  blockchain_address TEXT,
  active BOOLEAN DEFAULT TRUE
);
```

## P079 — Audit Log Table
```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  action TEXT,
  resource_type TEXT,
  resource_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## P080 — Row Level Security Policies
```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

-- Customers can read own orders
CREATE POLICY "customer_own_orders" ON orders
  FOR SELECT USING (customer_id = auth.uid());

-- Drivers can see assigned orders
CREATE POLICY "driver_assigned_orders" ON orders
  FOR SELECT USING (driver_id = (
    SELECT id FROM drivers WHERE id = auth.uid()
  ));

-- Partners see own orders
CREATE POLICY "partner_own_orders" ON orders
  FOR SELECT USING (partner_id IN (
    SELECT id FROM partners WHERE contact_email = auth.email()
  ));
```

## P081 — MongoDB Collections

### delivery_events
```javascript
{
  _id: ObjectId,
  orderId: "uuid",
  eventType: "order.placed" | "dispatched" | "delivered",
  timestamp: ISODate,
  payload: {
    driverId, partnerId, customerId,
    location: { lat, lng }
  },
  kafkaOffset: NumberLong,
  processed: Boolean
}
```

### menus
```javascript
{
  _id: ObjectId,
  partnerId: "uuid",
  slug: "restaurant-name",
  categories: [{
    name: "Mains",
    displayOrder: 1,
    items: [{
      id: "uuid",
      name: "Dish Name",
      description: "...",
      price: 250.00,
      images: ["cloudinary-url"],
      allergens: ["gluten"],
      isVegetarian: false,
      isAvailable: true,
      preparationTime: 25
    }]
  }],
  lastSyncedAt: ISODate,
  version: 42
}
```

### agent_runs
```javascript
{
  _id: ObjectId,
  runId: "uuid",
  agentType: "dispatch_decision" | "fraud_investigation",
  startedAt: ISODate,
  completedAt: ISODate,
  status: "completed" | "hitl_pending" | "failed",
  confidence: 0.87,
  inputs: {},
  outputs: {},
  stateSnapshots: [],
  tokenUsage: { input: 1240, output: 380 }
}
```

## P082 — Redis Cache Patterns
```bash
# Session data
session:{userId}                TTL: 24h

# Rate limiting
ratelimit:{apiKey}:{window}    TTL: 60s
ratelimit:{ip}:{endpoint}      TTL: 60s

# Menu cache
cache:menu:{slug}               TTL: 60s

# Driver pool
cache:driver:pool:{zone}       TTL: 10s

# Driver location
geo:driver:{driverId}          TTL: 30s

# Dispatch lock
lock:dispatch:{orderId}         TTL: 5s
```

## P083 — TimescaleDB Hypertables

### vehicle_telemetry
```sql
CREATE TABLE vehicle_telemetry (
  time TIMESTAMPTZ NOT NULL,
  vehicle_id UUID NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  speed_kmh REAL,
  battery_pct REAL,
  engine_temp_c REAL,
  fuel_pct REAL,
  odometer_km REAL,
  error_codes TEXT[]
);
SELECT create_hypertable('vehicle_telemetry', 'time');
SELECT add_retention_policy('vehicle_telemetry', INTERVAL '90 days');
```

### carbon_events
```sql
CREATE TABLE carbon_events (
  time TIMESTAMPTZ NOT NULL,
  vehicle_id UUID NOT NULL,
  route_km REAL,
  is_ev BOOLEAN,
  co2_kg REAL,
  zone TEXT
);
SELECT create_hypertable('carbon_events', 'time');
```

## P084 — Elasticsearch Indices

### menus index
```json
PUT /menus
{
  "mappings": {
    "properties": {
      "partnerId": { "type": "keyword" },
      "restaurantName": { "type": "text" },
      "cuisine": { "type": "keyword" },
      "itemName": { "type": "text" },
      "price": { "type": "float" },
      "location": { "type": "geo_point" }
    }
  }
}
```

### drivers index
```json
PUT /drivers
{
  "mappings": {
    "properties": {
      "driverId": { "type": "keyword" },
      "zone": { "type": "keyword" },
      "status": { "type": "keyword" },
      "performanceScore": { "type": "float" },
      "currentLocation": { "type": "geo_point" }
    }
  }
}
```

## P085-P090 — Additional Schemas
- P085: Indexes for performance optimization
- P086: Migration rollback procedures
- P087: Backup and recovery procedures
- P088: Database connection pooling config
- P089: Query optimization guidelines
- P090: Data archiving policies

---

## Database Summary
| Database | Use Case |
|----------|----------|
| PostgreSQL (Supabase) | Users, drivers, orders, payments |
| MongoDB Atlas | Event logs, menus, agent runs |
| Redis | Sessions, caching, rate limiting |
| TimescaleDB | IoT telemetry, carbon tracking |
| Elasticsearch | Menu & driver search |

**Phase Group D Complete! Ready for Phase Group E — Auth & Gateway (P091-P110)**
