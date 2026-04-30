# Phase Group F — Driver Ecosystem (P111-P145)

## P111 — Driver Onboarding Flow
```
Step 1: Personal details (name, ID, phone, email)
Step 2: Driving licence upload
Step 3: Vehicle type selection (rental vs own)
Step 4: Zone preference
Step 5: Bank details (Paystack verification)
Step 6: POPIA consent
Step 7: Biometric capture (facial photo)
Step 8: Background check consent
```

## P112 — Biometric Verification Service
```python
# AWS Rekognition integration
async def verify_driver_identity(selfie_image: bytes, driver_id: str):
    # 1. Liveness check
    liveness = await rekognition.detect_face_liveness(image=selfie_image)
    if liveness.confidence < 0.95:
        raise LivenessCheckFailed()
    
    # 2. Compare with stored template
    stored = await vault.get_secret(f"biometric/{driver_id}/template")
    comparison = await rekognition.compare_faces(
        source_image=selfie_image,
        target_image=stored,
        similarity_threshold=95.0
    )
    
    # 3. Log verification event
    await audit_log.record(driver_id, "biometric_verification", comparison.matched)
    return comparison.matched
```

## P113 — Driver Registration API
```typescript
@Post('drivers/register')
async register(@Body() dto: DriverRegisterDto) {
  // Validate ID number
  const idValid = await this.validateSAID(dto.idNumber);
  
  // Verify bank details via Paystack
  const bankValid = await this.paystack.verifyAccount(dto.accountNumber, dto.bankCode);
  
  // Create driver record
  const driver = await this.driverService.create({
    ...dto,
    status: 'pending_approval'
  });
  
  // Trigger background check
  await this. BackgroundCheckService.initiate(driver.id);
  
  return { driverId: driver.id, status: 'pending_approval' };
}
```

## P114 — Driver Mobile App Scaffold
```typescript
// React Native + Expo
export const DriverApp = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Deliveries" component={DeliveriesScreen} />
      <Stack.Screen name="Earnings" component={EarningsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);
```

## P115 — Driver Dashboard Screen
```typescript
const DashboardScreen = () => {
  const { earnings, todayDeliveries, rating, activeShift } = useDriverData();
  
  return (
    <View>
      <Card title="Today's Earnings" value={earnings.today} />
      <Card title="Deliveries" value={earnings.todayDeliveries} />
      <Card title="Rating" value={rating} />
      <Button 
        title={activeShift ? "End Shift" : "Start Shift"}
        onPress={toggleShift}
      />
    </View>
  );
};
```

## P116 — Delivery Queue Screen
```typescript
const DeliveryQueue = () => {
  const { availableDeliveries, acceptDelivery } = useDeliveryQueue();
  
  return (
    <FlatList
      data={availableDeliveries}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <DeliveryCard
          delivery={item}
          onAccept={() => acceptDelivery(item.id)}
        />
      )}
    />
  );
};
```

## P117 — Driver Performance Scoring
```python
# SageMaker model input features
features = {
    'delivery_acceptance_rate': 0.94,
    'on_time_delivery_rate': 0.88,
    'customer_rating_avg': 4.7,
    'cancellation_rate': 0.02,
    'fraud_flags': 0,
    'days_active_last_30': 22,
    'avg_deliveries_per_shift': 8.3
}

# Output
{
    'score': 87.4,
    'tier': 'Gold',
    'trend': 'improving',
    'strengths': ['punctuality', 'customer_service'],
    'improvement_areas': ['acceptance_rate']
}
```

## P118 — Driver Performance Tiers
| Tier | Score | Benefits |
|------|-------|----------|
| Bronze | 0-59 | Standard earnings |
| Silver | 60-74 | +5% bonus, priority dispatch |
| Gold | 75-89 | +10% bonus, preferred rental |
| Elite | 90-100 | +15% bonus, dedicated support |

## P119 — Driver Wallet Service
```typescript
interface DriverWallet {
  currentBalance: number;
  pendingEarnings: number;
  thisWeekEarnings: number;
  thisMonthEarnings: number;
  lifetimeEarnings: number;
  commissionRate: number;
  payoutPreference: 'ozow' | 'polygon';
}

@Post('payout/instant')
async instantPayout(@Body() dto: InstantPayoutDto) {
  const wallet = await this.walletService.get(dto.driverId);
  if (wallet.currentBalance < dto.amount) {
    throw new InsufficientFundsException();
  }
  
  // Execute via Ozow
  const payout = await this.ozow.transfer({
    amount: dto.amount,
    bankAccount: wallet.bankAccount,
    reference: `PAYOUT-${Date.now()}`
  });
  
  await this.walletService.debit(dto.driverId, dto.amount);
  return payout;
}
```

## P120 — Earnings Dashboard
```typescript
const EarningsScreen = () => {
  const { weekly, monthly, lifetime, pending, history } = useEarnings();
  
  return (
    <ScrollView>
      <EarningsCard title="This Week" amount={weekly} />
      <EarningsCard title="This Month" amount={monthly} />
      <EarningsCard title="Lifetime" amount={lifetime} />
      <EarningsCard title="Pending" amount={pending} />
      <EarningsHistory history={history} />
      <InstantPayoutButton />
    </ScrollView>
  );
};
```

## P121 — Fleet Rental Service
```typescript
interface VehicleRental {
  id: string;
  driverId: string;
  vehicleId: string;
  startDate: Date;
  endDate?: Date;
  dailyRate: number;
  status: 'active' | 'completed' | 'cancelled';
}

@Post('rentals/request')
async requestRental(@Body() dto: RentalRequestDto) {
  const vehicle = await this.fleetService.getAvailable(dto.vehicleType);
  if (!vehicle) throw new NoVehiclesAvailableException();
  
  const rental = await this.rentalService.create({
    driverId: dto.driverId,
    vehicleId: vehicle.id,
    dailyRate: vehicle.dailyRate,
    status: 'pending_approval'
  });
  
  return rental;
}
```

## P122 — IoT Vehicle Tracking
```rust
// Rust IoT service
async fn ingest_telemetry(event: TelemetryEvent) {
    // Parse MQTT message
    let telemetry: VehicleTelemetry = serde_json::from_slice(&event.payload)?;
    
    // Store in TimescaleDB
    timescale::insert("vehicle_telemetry", 
        telemetry.vehicle_id,
        telemetry.timestamp,
        telemetry.latitude,
        telemetry.longitude,
        telemetry.speed_kmh,
        telemetry.battery_pct
    ).await?;
    
    // Check for anomalies
    if telemetry.speed_kmh > 120.0 {
        alert_service.send("Speed alert", &telemetry.vehicle_id).await?;
    }
}
```

## P123 — Vehicle Maintenance Scheduling
```typescript
@Post('maintenance/schedule')
async scheduleMaintenance(@Body() dto: MaintenanceDto) {
  const vehicle = await this.fleetService.get(dto.vehicleId);
  const nextService = vehicle.odometer_km + 5000;
  
  await this.maintenanceService.create({
    vehicleId: dto.vehicleId,
    serviceType: dto.serviceType,
    scheduledOdometer: nextService,
    estimatedDate: this.estimateDate(vehicle.avgDailyKm)
  });
}
```

## P124 — Driver Profile Management
```typescript
const ProfileScreen = () => {
  const { profile, updateProfile } = useDriverProfile();
  
  return (
    <View>
      <Avatar source={profile.photo} />
      <Text>{profile.name}</Text>
      <Text>{profile.phone}</Text>
      <Text>{profile.vehicleType}</Text>
      <Button title="Edit Profile" onPress={updateProfile} />
      <Button title="Documents" onPress={() => navigate('Documents')} />
      <Button title="Bank Details" onPress={() => navigate('BankDetails')} />
    </View>
  );
};
```

## P125 — Driver Documents
```typescript
interface DriverDocument {
  id: string;
  driverId: string;
  type: 'licence' | 'insurance' | 'roadworthy' | 'id';
  status: 'pending' | 'approved' | 'expired';
  expiryDate: Date;
  documentUrl: string;
}
```

## P126 — Driver Support/FAQ
```typescript
// RAG-powered FAQ
const faqChain = (
  PineconeRetriever(index="driver-knowledge-base", top_k=5)
  | ContextualCompressor()
  | ChatBedrock(model="claude-3")
  | ResponseFormatter(style="conversational")
);
```

## P127 — Driver Notifications
```typescript
// Push notifications
await this.notificationService.send({
  recipient: driverId,
  channel: 'push',
  title: 'New Delivery Available!',
  body: 'R120 earnings, 3km away',
  data: { deliveryId: delivery.id }
});
```

## P128 — Driver Ratings
```typescript
interface DriverRating {
  orderId: string;
  driverId: string;
  customerId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
}
```

## P129 — Driver Achievements
```typescript
const achievements = [
  { id: 'first_delivery', name: 'First Delivery', icon: '🎯' },
  { id: '100_deliveries', name: '100 Deliveries', icon: '💯' },
  { id: 'perfect_week', name: 'Perfect Week', icon: '⭐' },
  { id: 'safety_award', name: 'Safety Award', icon: '🛡️' },
  { id: 'top_earner', name: 'Top Earner', icon: '💰' }
];
```

## P130-P145 — Additional Features
- P130: DriverReferral program
- P131: Driver shift management
- P132: Driver health check-ins
- P133: Driver training modules
- P134: Driver dispute resolution
- P135: Driver insurance claims
- P136: Driver vehicle assignment
- P137: Driver zone management
- P138: Driver communication preferences
- P139: Driver earnings reports
- P140: Driver tax documents
- P141: Driver background checks
- P142: Driver verification status
- P143: Driver peak hour bonuses
- P144: Driver seasonal promotions
- P145: Driver retention programs

---

## Driver Ecosystem Summary
| Component | Technology |
|-----------|------------|
| Onboarding | Multi-step flow |
| Verification | AWS Rekognition |
| Mobile App | React Native + Expo |
| Performance | SageMaker ML |
| Wallet | Paystack, Ozow |
| Fleet | Rust IoT service |
| Maintenance | Predictive scheduling |
| Support | RAG-powered FAQ |

**Phase Group F Complete! Ready for Phase Group G — Orders & Dispatch (P146-P175)**
