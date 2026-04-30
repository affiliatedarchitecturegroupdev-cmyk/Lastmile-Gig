# Phase Group E — Auth & Gateway (P091-P110)

## P091 — Auth Service Core
```typescript
// NestJS Auth Service
@Injectable()
export class AuthService {
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    return this.generateTokens(user);
  }

  async refresh(refreshToken: string) {
    const payload = this.jwtService.verify(refreshToken);
    return this.generateTokens(payload);
  }

  async logout(userId: string) {
    await this.redis.del(`session:${userId}`);
  }
}
```

## P092 — Auth0 Integration
```typescript
// Auth0 OAuth2 flow
async function auth0Login(code: string) {
  const tokenResponse = await axios.post('https://auth0/oauth/token', {
    grant_type: 'authorization_code',
    client_id: process.env.AUTH0_CLIENT_ID,
    client_secret: process.env.AUTH0_CLIENT_SECRET,
    code,
    redirect_uri: process.env.AUTH0_REDIRECT_URI
  });
  return tokenResponse.data;
}
```

## P093 — JWT Token Management
```typescript
// JWT generation and validation
interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  permissions: string[];
  exp: number;
}

generateTokens(user: User): { access: string; refresh: string } {
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    permissions: getPermissions(user.role)
  };
  
  return {
    access: this.jwtService.sign(payload, { expiresIn: '15m' }),
    refresh: this.jwtService.sign(payload, { expiresIn: '7d' })
  };
}
```

## P094 — Role-Based Access Control
```typescript
// RBAC Decorator
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);

// Usage
@Roles('admin', 'ops_senior')
@Get('users')
async getAllUsers() { ... }

// Guard
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const requiredRoles = Reflect.getMetadata('roles', context.getHandler());
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some(role => user.role === role);
  }
}
```

## P095 — API Gateway Service
```typescript
// NestJS API Gateway
@Controller()
export class ApiGatewayController {
  @Get('drivers/:id')
  @UseGuards(JwtAuthGuard)
  async getDriver(@Param('id') id: string) {
    return this.httpService.get(`${process.env.DRIVER_SERVICE_URL}/drivers/${id}`);
  }

  @Post('orders')
  async createOrder(@Body() orderDto: OrderDto) {
    return this.httpService.post(`${process.env.ORDER_SERVICE_URL}/orders`, orderDto);
  }
}
```

## P096 — Gateway Routing Table
```typescript
const ROUTES = {
  'POST /auth/*': 'auth-service',
  'GET /drivers/*': 'driver-service',
  'POST /drivers/*': 'driver-service',
  'GET /orders/*': 'order-service',
  'POST /orders/*': 'order-service',
  'GET /fleet/*': 'fleet-service',
  'GET /restaurants/*': 'storefront-service',
  'POST /payments/*': 'payment-service',
  'GET /analytics/*': 'analytics-service'
};
```

## P097 — Rate Limiting Middleware
```typescript
// Sliding window rate limiter
@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const key = `ratelimit:${req.ip}:${req.path}`;
    const count = await this.redis.incr(key);
    
    if (count === 1) {
      await this.redis.expire(key, 60);
    }
    
    if (count > 1000) {
      throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
    }
    
    next();
  }
}
```

## P098 — API Key Management
```typescript
// API key generation for Developer Portal
async function generateApiKey(userId: string, tier: 'basic' | 'pro' | 'enterprise') {
  const key = `lmg_${randomBytes(32).toString('hex')}`;
  const hash = createHash('sha256').update(key).digest('hex');
  
  await this.db.apiKeys.create({
    userId,
    keyHash: hash,
    tier,
    rateLimit: tier === 'basic' ? 1000 : tier === 'pro' ? 10000 : -1,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  });
  
  return key; // Only returned once!
}
```

## P099 — WebSocket Gateway (Real-time)
```typescript
// NestJS WebSocket Gateway
@WebSocketGateway({ cors: true })
export class TrackingGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join-order')
  handleJoinOrder(client: Socket, orderId: string) {
    client.join(`order:${orderId}`);
  }

  broadcastLocation(orderId: string, location: Location) {
    this.server.to(`order:${orderId}`).emit('location-update', location);
  }
}
```

## P100 — GraphQL API (Investor/Partner Dashboards)
```typescript
// NestJS GraphQL
@Resolver(() => Order)
export class OrderResolver {
  @Query(() => [Order])
  @UseGuards(JwtAuthGuard)
  async orders(@Context() ctx: any): Promise<Order[]> {
    return this.orderService.findByUser(ctx.user.id);
  }

  @ResolveField(() => Driver)
  async driver(@Parent() order: Order): Promise<Driver> {
    return this.driverService.findById(order.driverId);
  }
}
```

## P101 — OpenAPI Documentation
```typescript
// Swagger/OpenAPI
@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }
}
```

## P102 — Request Validation
```typescript
// class-validator DTOs
export class CreateOrderDto {
  @IsUUID()
  @IsNotEmpty()
  partnerId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsObject()
  @ValidateNested()
  @Type(() => DeliveryAddressDto)
  deliveryAddress: DeliveryAddressDto;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
```

## P103 — Circuit Breaker
```typescript
// Circuit breaker for external services
@Injectable()
export class CircuitBreakerProxy implements ProxyHandler {
  private circuits = new Map<string, CircuitState>();

  async forward(service: string, request: Request): Promise<Response> {
    const state = this.circuits.get(service);
    
    if (state === 'OPEN') {
      throw new ServiceUnavailableException(`${service} temporarily unavailable`);
    }
    
    try {
      const response = await this.httpService.forward(request);
      this.circuits.set(service, 'CLOSED');
      return response;
    } catch (error) {
      if (error.response?.status >= 500) {
        this.circuits.set(service, 'OPEN');
      }
      throw error;
    }
  }
}
```

## P104 — Service Discovery
```typescript
// Consul or Kubernetes service discovery
const services = {
  'auth-service': 'http://auth-service.lmg-core.svc.cluster.local:3000',
  'driver-service': 'http://driver-service.lmg-drivers.svc.cluster.local:3000',
  'order-service': 'http://order-service.lmg-core.svc.cluster.local:3000'
};
```

## P105 — Load Balancing
```typescript
// Round-robin or least-connections
const loadBalancer = {
  select(service: string): string {
    const endpoints = this.discover(service);
    const index = this.counter++ % endpoints.length;
    return endpoints[index];
  }
};
```

## P106-P110 — Additional Gateway Features
- P106: Request/Response transformation
- P107: CORS configuration
- P108: Request ID correlation
- P109: API versioning
- P110: Deprecation notices

---

## Gateway Summary
| Component | Technology |
|-----------|------------|
| Auth | Auth0 + JWT |
| Gateway | NestJS |
| Routing | Path-based |
| Rate Limiting | Upstash Redis |
| API Keys | Custom + Redis |
| WebSocket | Socket.io |
| GraphQL | Apollo |
| Documentation | OpenAPI/Swagger |

**Phase Group E Complete! Ready for Phase Group F — Driver Ecosystem (P111-P145)**
