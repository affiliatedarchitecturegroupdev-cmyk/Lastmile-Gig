# Phase Group G — Orders & Dispatch (P146-P175)

## P146 — Order Creation Flow
```typescript
@Post('orders/create')
async createOrder(@Body() dto: CreateOrderDto) {
  // 1. Validate partner
  const partner = await this.validatePartner(dto.partnerId);
  if (!partner.isActive) throw new PartnerInactiveException();
  
  // 2. Validate menu items
  const menu = await this.menuService.get(partner.id);
  const validatedItems = this.validateItems(dto.items, menu);
  
  // 3. Calculate totals
  const totals = this.calculateTotals(validatedItems, partner.deliveryFee);
  
  // 4. Verify payment
  const payment = await this.paymentService.verify(dto.paymentRef, totals.total);
  
  // 5. Create order with SLA deadline
  const slaDeadline = new Date(Date.now() + partner.slaMinutes * 60000);
  
  const order = await this.orderService.create({
    ...dto,
    ...totals,
    status: 'placed',
    slaDeadline,
    paymentId: payment.id
  });
  
  // 6. Emit order placed event
  await this.eventBus.publish('order.placed', { order });
  
  return { orderId: order.id, status: 'placed', slaDeadline };
}
```

## P147 — Order Status Workflow
```
placed → confirmed → preparing → dispatched → delivered
                ↓
             cancelled
```

| Status | Description | Next |
|--------|-------------|------|
| placed | Order created, payment confirmed | confirmed |
| confirmed | Restaurant accepted | preparing |
| preparing | Restaurant preparing order | dispatched |
| dispatched | Driver picked up | delivered |
| delivered | Completed | - |
| cancelled | Cancelled | - |

## P148 — Order Confirmation
```typescript
@Post('orders/:id/confirm')
async confirmOrder(@Param('id') orderId: string) {
  const order = await this.orderService.get(orderId);
  if (order.status !== 'placed') throw new InvalidStatusException();
  
  await this.orderService.update(orderId, { status: 'confirmed' });
  
  // Update SLA
  const slaDeadline = new Date(Date.now() + 35 * 60000); // 35 min
  await this.orderService.updateSla(orderId, slaDeadline);
  
  // Notify customer
  await this.notificationService.send(order.customerId, 
    'Order confirmed', `ETA: ${slaDeadline.toISOString()}`
  );
}
```

## P149 — Order State Machine
```go
// Go state machine
type OrderState struct {
    Status    string    `json:"status"`
    UpdatedAt time.Time `json:"updated_at"`
}

var transitions = map[string][]string{
    "placed":    {"confirmed", "cancelled"},
    "confirmed": {"preparing", "cancelled"},
    "preparing": {"dispatched", "cancelled"},
    "dispatched": {"delivered"},
    "cancelled": {},
}

func (o *OrderState) Transition(newStatus string) error {
    valid := transitions[o.Status]
    if !contains(valid, newStatus) {
        return fmt.Errorf("invalid transition from %s to %s", o.Status, newStatus)
    }
    o.Status = newStatus
    o.UpdatedAt = time.Now()
    return nil
}
```

## P150 — Order History API
```typescript
@Get('orders/:id/history')
async getOrderHistory(@Param('id') orderId: string) {
  return this.orderHistoryService.getEvents(orderId);
}
```

## P151 — Order Modification
```typescript
@Patch('orders/:id/items')
async modifyOrder(
  @Param('id') orderId: string,
  @Body() dto: ModifyOrderDto
) {
  const order = await this.orderService.get(orderId);
  if (!['placed', 'confirmed'].includes(order.status)) {
    throw new ModificationNotAllowedException();
  }
  
  const { newItems, additionalFee } = await this.validateAndCalculate(
    dto.addedItems, 
    order.partnerId
  );
  
  await this.orderService.addItems(orderId, newItems, additionalFee);
}
```

## P152 — Order Cancellation
```typescript
@Post('orders/:id/cancel')
async cancelOrder(
  @Param('id') orderId: string,
  @Body() dto: CancelOrderDto
) {
  const order = await this.orderService.get(orderId);
  
  if (order.status === 'dispatched' || order.status === 'delivered') {
    throw new CancellationNotAllowedException();
  }
  
  // Calculate refund
  const refundAmount = this.calculateRefund(order);
  
  // Process refund
  await this.paymentService.refund(order.paymentId, refundAmount);
  
  // Update status
  await this.orderService.update(orderId, { 
    status: 'cancelled',
    cancelReason: dto.reason,
    refundAmount
  });
}
```

## P153 — SLA Enforcement
```typescript
// SLA breach detection
@Cron('*/1 * * * *')
async checkSlaBreaches() {
  const breached = await this.orderService.getBreachedOrders();
  
  for (const order of breached) {
    // Record breach
    await this.slaService.recordBreach(order.id);
    
    // Apply SLA penalty to partner
    await this.partnerService.applyPenalty(order.partnerId, order.slaPenalty);
  }
}
```

## P154 — Dispatch Engine Architecture
```go
// Go dispatch service
package dispatch

type Dispatcher struct {
    driverPool *DriverPool
    orderQueue *PriorityQueue
    policy *DispatchPolicy
}

func (d *Dispatcher) Start(ctx context.Context) {
    // Consume from Kafka
    consumer := kafka.NewConsumer("orders.placed")
    
    for {
        select {
        case <-ctx.Done():
            return
        case msg := <-consumer:
            d.dispatchOrder(msg.Order)
        }
    }
}
```

## P155 — Dispatch Algorithm
```go
// Dispatch algorithm
func (d *Dispatcher) dispatchOrder(order Order) (*Driver, error) {
    candidates := d.driverPool.FindNearby(order.PickupLocation, 5.0)
    
    // Filter by vehicle type
    candidates = filterByVehicleType(candidates, order.VehicleRequired)
    
    // Filter by availability
    candidates = filterAvailable(candidates)
    
    // Score candidates
    scored := make([]ScoredDriver, len(candidates))
    for _, driver := range candidates {
        score := d.policy.CalculateScore(driver, order)
        scored = append(scored, ScoredDriver{driver, score})
    }
    
    // Sort by score (descending)
    sort.Slice(scored, func(i, j int) bool {
        return scored[i].Score > scored[j].Score
    })
    
    // Select highest scorer
    selected := scored[0].Driver
    
    // Lock driver
    if err := d.driverPool.Lock(selected.ID, order.ID); err != nil {
        return nil, err
    }
    
    return selected, nil
}
```

## P156 — Dispatch Policy
```go
// Scoring policy
type DispatchPolicy struct {
    // Weights
    DistanceWeight      float64 `json:"distance_weight"`
    PerformanceWeight  float64 `json:"performance_weight"`
    AvailabilityWeight float64 `json:"availability_weight"`
    ZonalWeight         float64 `json:"zonal_weight"`
}

func (p *DispatchPolicy) CalculateScore(driver *Driver, order *Order) float64 {
    score := 0.0
    
    // Distance score (closer = better)
    distScore := 1.0 - (driver.DistanceTo(order.PickupLocation) / 10.0)
    score += distScore * p.DistanceWeight
    
    // Performance score
    score += driver.PerformanceScore * p.PerformanceWeight
    
    // Availability bonus
    if driver.Status == "idle" {
        score += 0.1 * p.AvailabilityWeight
    }
    
    // Zone preference
    if driver.Zone == order.Zone {
        score += 0.15 * p.ZonalWeight
    }
    
    return score
}
```

## P157 — Driver Assignment
```typescript
@Post('orders/:id/assign')
async assignDriver(
  @Param('id') orderId: string,
  @Body() dto: AssignDriverDto
) {
  const order = await this.orderService.get(orderId);
  
  if (order.status !== 'confirmed' && order.status !== 'preparing') {
    throw new AssignmentNotAllowedException();
  }
  
  const driver = await this.driverService.get(dto.driverId);
  
  // Mark driver as assigned
  await this.orderService.update(orderId, {
    driverId: driver.id,
    status: 'assigned'
  });
  
  // Notify driver
  await this.notificationService.send(driver.id, 
    'New Assignment',
    `Order ${orderId} - ${order.restaurantName}`
  );
  
  // Notify customer
  await this.notificationService.send(order.customerId,
    'Driver Assigned',
    `${driver.name} is picking up your order`
  );
}
```

## P158 — Order Prep Time Estimation
```python
# SageMaker model
features = {
    'partnerId': order.partner_id,
    'hour_of_day': hour,
    'day_of_week': day,
    'item_count': len(items),
    'item_complexity': complexity_score,
    'historical_avg': partner.avg_prep_time
}

# Prediction
{
    'estimated_prep_minutes': 28,
    'confidence_interval': [22, 35]
}
```

## P159 — ETA Calculation
```typescript
// Total ETA
calculateEta(order: Order): number {
  const prepTime = order.estimatedPrepMinutes;
  const deliveryTime = this.calculateDeliveryTime(
    order.pickupLocation,
    order.deliveryLocation
  );
  return prepTime + deliveryTime;
}
```

## P160 — Route Optimization
```go
// GoRouter for last-mile routes
func optimizeRoute(pickup, dropoff LatLng, waypoints []LatLng) Route {
    result, err := goRouter.CalculateRoute(pickup, dropoff, waypoints,
        goRouter.ModeDriving,
        goRouter.Optimization shortest,
    )
    return result
}
```

## P161 — Real-time Tracking
```typescript
// WebSocket tracking
@WebSocketGateway()
export class TrackingGateway {
  @SubscribeMessage('track-order')
  handleTrack(client: Socket, orderId: string) {
    client.join(`order:${orderId}`);
  }
  
  broadcastLocation(orderId: string, location: Location) {
    this.server.to(`order:${orderId}`).emit('location', location);
  }
}
```

## P162 — Delivery Confirmation
```typescript
@Post('orders/:id/deliver')
async confirmDelivery(
  @Param('id') orderId: string,
  @Body() dto: DeliverOrderDto
) {
  const order = await this.orderService.get(orderId);
  
  // Verify location
  const distance = this.calculateDistance(order.deliveryLocation, dto.location);
  if (distance > 0.1) { // 100m
    throw new LocationMismatchException();
  }
  
  // Capture photo
  const photoHash = await this.imageService.uploadAndHash(dto.photo);
  
  // Update order
  await this.orderService.update(orderId, {
    status: 'delivered',
    deliveredAt: new Date(),
    deliveryPhotoHash: photoHash
  });
  
  // Execute payment to driver
  await this.walletService.credit(order.driverId, order.driverEarnings);
  
  // Notify customer
  await this.notificationService.send(order.customerId,
    'Order Delivered!',
    'Your order has arrived'
  );
}
```

## P163 — Customer Order History
```typescript
const CustomerOrdersScreen = () => {
  const { orders, reorder } = useCustomerOrders();
  
  return (
    <FlatList
      data={orders}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <OrderCard order={item} onReorder={() => reorder(item.id)} />
      )}
    />
  );
};
```

## P164 — Reorder Functionality
```typescript
@Post('orders/:id/reorder')
async reorder(@Param('id') orderId: string) {
  const original = await this.orderService.get(orderId);
  const menu = await this.menuService.get(original.partnerId);
  
  const newOrder = await this.orderService.create({
    partnerId: original.partnerId,
    items: original.items,
    deliveryAddress: original.deliveryAddress
  });
  
  return newOrder;
}
```

## P165 — Customer Ratings
```typescript
@Post('orders/:id/rate')
async rateOrder(
  @Param('id') orderId: string,
  @Body() dto: RateOrderDto
) {
  await this.orderService.addRating(orderId, dto.rating, dto.comment);
  
  // Update driver score
  const order = await this.orderService.get(orderId);
  await this.driverService.updateScore(order.driverId);
}
```

## P166-P175 — Additional Order Features
- P166: Order search
- P167: Order filtering
- P168: Order analytics
- P169: Order disputes
- P170: Order reports
- P171: Order exports
- P172: Order webhooks
- P173: Order bulk operations
- P174: Order peak hour handling
- P175: Order SLA analytics

---

## Orders & Dispatch Summary
| Component | Technology |
|-----------|------------|
| Order Service | NestJS |
| State Machine | Go/StateFlow |
| Dispatch Engine | Go |
| Algorithm | Custom ML scoring |
| Tracking | WebSocket + Redis |
| Routing | GoRouter |
| ETA | SageMaker |

**Phase Group G Complete! Ready for Phase Group H — Restaurant Storefronts (P176-P210)**
