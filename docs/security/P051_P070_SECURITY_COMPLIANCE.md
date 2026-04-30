# Phase Group C — Security & Compliance (P051-P070)

## P051 — GitHub Actions Base CI Pipeline
```yaml
name: CI Pipeline
on: [push, pull_request]
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - run: npm ci
    - run: npm test
    - run: npm run lint
```

## P052 — Snyk Integration
```yaml
- name: Snyk security scan
  uses: snyk/actions/docker@master
  with:
    image: lastmilegig/${{ matrix.service }}
    args: --severity-threshold=high
```

## P053 — SonarQube Self-Hosted
```bash
docker run -d --name sonarqube -p 9000:9000 sonarqube:latest
```
- Coverage ≥ 80%
- No new Critical code smells

## P054 — SonarQube Quality Gate
```json
{
  "conditions": [
    {"metric": "coverage", "operator": "GREATER_THAN", "value": 80},
    {"metric": "new_coverage", "operator": "LESS_THAN", "value": 50}
  ]
}
```

## P055 — Checkov IaC Scanning
```yaml
- name: Checkov scan
  uses: bridgecrewio/checkov-action@master
  with:
    directory: infrastructure/terraform
    framework: terraform
```
Blocks CI on HIGH/CRITICAL findings

## P056 — OWASP ZAP Staging DAST
```yaml
- name: OWASP ZAP Scan
  uses: zaproxy/action-baseline@v0.9.0
  with:
    target: 'https://staging.lastmilegig.aagais.co.za'
```

## P057 — Auth0 Tenant Setup
```bash
# Create Auth0 tenant for production
# Configure:
# - Universal Login
# - Refresh token rotation
# - Session timeout: 8h (ops), 30 days (customers)
# - Brute force protection: 10 failed → 24h lockout
```

## P058 — Auth0 Application Configurations
- SPA (Single Page App) for customer web
- M2M for service-to-service
- Regular web for partner portal
- API for Developer Portal

## P059 — Auth0 RBAC Rules
```typescript
enum UserRole {
  CUSTOMER = 'customer',
  DRIVER = 'driver',
  PARTNER_STAFF = 'partner_staff',
  PARTNER_ADMIN = 'partner_admin',
  OPS_STAFF = 'ops_staff',
  OPS_SENIOR = 'ops_senior',
  FLEET_MANAGER = 'fleet_manager',
  FINANCE = 'finance',
  ESG_OFFICER = 'esg_officer',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}
```

## P060 — AWS Cognito Driver & M2M Pools
```hcl
resource "aws_cognito_user_pool" "driver_pool" {
  name = "lastmilegig-drivers-pool"
  auto_verified_attributes = ["email"]
}
```

## P061 — JWT Validation Middleware (NestJS)
```typescript
@UseGuards(JwtAuthGuard)
async findAll() { ... }
// Reusable auth guard for all NestJS services
```

## P062 — API Key Management
```typescript
// API key generation, hashing, validation
const apiKey = await generateApiKey();
const hash = await hashApiKey(apiKey);
await saveToDb(hash, userId);
```

## P063 — Rate Limiting Upstash Redis
```typescript
@UseGuards(RateLimitGuard)
async endpoint() { ... }
// Sliding window rate limiter
// 1000 req/hour Basic, 10000 Pro, unlimited Enterprise
```

## P064 — Vault Dynamic Database Credentials
```hcl
resource "vault_db_secret_connection" "postgres" {
  plugin_name = "postgresql-database-plugin"
  allowed_roles = ["app-role"]
}
```

## P065 — AWS KMS Key Setup
```hcl
resource "aws_kms_key" "lastmilegig" {
  description = "Lastmile Gig main encryption key"
  key_usage = "ENCRYPT_DECRYPT"
  enable_key_rotation = true
}
```

## P066-P070 — POPIA Compliance
```sql
-- POPIA consent management schema
CREATE TABLE popia_consent (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  consent_type TEXT,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
);
-- Data subject rights:
-- /api/v1/users/me/data-deletion
-- 30-day processing SLA
-- Audit logging all data access
```

---

## Security Stack Summary
| Layer | Technology |
|-------|-----------|
| CI/CD | GitHub Actions |
| Dependency Scan | Snyk |
| SAST | SonarQube |
| DAST | OWASP ZAP |
| IaC Scan | Checkov |
| Identity | Auth0, Cognito |
| Auth Middleware | JWT, RBAC |
| Rate Limiting | Upstash Redis |
| Secrets | HashiCorp Vault |
| Encryption | AWS KMS |
| Compliance | POPIA |

**Phase Group C Complete! Ready for Phase Group D — Database Schemas (P071-P070)**
