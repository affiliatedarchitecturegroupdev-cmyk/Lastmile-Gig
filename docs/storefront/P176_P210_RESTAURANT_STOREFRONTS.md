# Phase Group H — Restaurant Storefronts (P176-P210)

## P176 — Partner Onboarding Flow
```
Step 1: Business info (name, type, address)
Step 2: CIPC registration upload
Step 3: VAT registration (if applicable)
Step 4: Bank details (Paystack verification)
Step 5: Menu import/upload
Step 6: Operating hours
Step 7: Delivery zones
Step 8: SLA selection
Step 9: POPIA consent
Step 10: Contract agreement
```

## P177 — Partner Registration API
```typescript
@Post('partners/register')
async register(@Body() dto: PartnerRegisterDto) {
  // Validate CIPC number
  const cipcValid = await this.cipdService.verify(dto.cipcNumber);
  if (!cipcValid) throw new InvalidCipcException();
  
  // Check slug availability
  const slugAvailable = await this.partnerService.checkSlug(dto.name);
  if (!slugAvailable) throw new SlugTakenException();
  
  // Create partner
  const partner = await this.partnerService.create({
    ...dto,
    slug: this.generateSlug(dto.name),
    status: 'pending_approval'
  });
  
  return { partnerId: partner.id };
}
```

## P178 — Menu Management System
```typescript
interface Menu {
  partnerId: string;
  categories: Category[];
  lastSyncedAt: Date;
  version: number;
}

interface Category {
  id: string;
  name: string;
  displayOrder: number;
  items: MenuItem[];
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  allergens: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  isAvailable: boolean;
  preparationTime: number;
}
```

## P179 — Menu Editor
```typescript
const MenuEditor = () => {
  const { menu, updateCategory, addItem, updateItem } = useMenu();
  
  return (
    <ScrollView>
      {menu.categories.map(category => (
        <CategoryCard key={category.id}>
          <Text>{category.name}</Text>
          <FlatList
            data={category.items}
            renderItem={({ item }) => (
              <MenuItemEditor item={item} onSave={updateItem} />
            )}
          />
          <Button title="Add Item" onPress={() => addItem(category.id)} />
        </CategoryCard>
      ))}
    </ScrollView>
  );
};
```

## P180 — Menu Sync Service
```python
# Menu sync from POS systems
async def sync_menu(partner_id: str, pos_system: str):
    if pos_system == "foodics":
        items = await foodics.get_menu(partner_id)
    elif pos_system == "synthus":
        items = await synthus.get_menu(partner_id)
    else:
        items = await generic.get_menu(partner_id)
    
    # Transform to platform format
    menu = transform_menu(items)
    
    # Update MongoDB
    await mongo.menus.update_one(
        {"partnerId": partner_id},
        {"$set": menu},
        upsert=True
    )
    
    return menu
```

## P181 — Menu Versioning
```typescript
interface MenuVersion {
  id: string;
  partnerId: string;
  version: number;
  snapshot: Menu;
  createdAt: Date;
  createdBy: string;
}

@Post('menus/:partnerId/versions')
async createVersion(@Param('partnerId') partnerId: string) {
  const current = await this.menuService.get(partnerId);
  
  await this.versionService.create({
    partnerId,
    version: current.version + 1,
    snapshot: current,
    createdAt: new Date()
  });
  
  return { version: current.version + 1 };
}
```

## P182 — Partner Operating Hours
```typescript
interface OperatingHours {
  partnerId: string;
  timezone: string;
  schedule: DaySchedule[];
}

interface DaySchedule {
  dayOfWeek: number; // 0=Sunday
  isOpen: boolean;
  openTime?: string; // "09:00"
  closeTime?: string; // "22:00"
}

@Patch('partners/:id/hours')
async updateHours(
  @Param('id') partnerId: string,
  @Body() dto: OperatingHoursDto
) {
  // Validate no overlapping hours
  this.validateHours(dto.schedule);
  
  await this.partnerService.updateHours(partnerId, dto);
  
  // Update cache
  await this.cacheService.delete(`open:${partnerId}`);
}
```

## P183 — Delivery Zone Management
```typescript
interface DeliveryZone {
  id: string;
  partnerId: string;
  name: string;
  polygon: GeoJSON;
  deliveryFee: number;
  minimumOrder: number;
  estimatedMinutes: number;
}

@Post('partners/:id/zones')
async addZone(
  @Param('id') partnerId: string,
  @Body() dto: DeliveryZoneDto
) {
  const zone = await this.zoneService.create({
    partnerId,
    ...dto,
    isValid: this.validatePolygon(dto.polygon)
  });
  
  return zone;
}
```

## P184 — Partner Dashboard
```typescript
const PartnerDashboard = () => {
  const { stats, recentOrders, revenue } = usePartnerData();
  
  return (
    <View>
      <StatsCard title="Today Orders" value={stats.todayOrders} />
      <StatsCard title="Today Revenue" value={revenue.today} />
      <StatsCard title="Avg Rating" value={stats.avgRating} />
      <StatsCard title="SLA Compliance" value={stats.slaCompliance} />
      <RecentOrders orders={recentOrders} />
    </View>
  );
};
```

## P185 — Partner Analytics
```typescript
interface PartnerAnalytics {
  ordersToday: number;
  ordersWeek: number;
  ordersMonth: number;
  revenueToday: number;
  revenueWeek: number;
  revenueMonth: number;
  avgOrderValue: number;
  topItems: MenuItem[];
  peakHours: HourDistribution[];
  slaCompliance: number;
  customerRatings: RatingDistribution[];
}
```

## P186 — Partner Order Notifications
```typescript
// New order sound + vibration
await this.notificationService.send({
  recipient: partnerId,
  channel: 'push' | 'sms',
  title: 'New Order!',
  body: 'Order #12345 - R350',
  sound: 'new_order',
  vibrate: true
});
```

## P187 — Partner Order Management
```typescript
const PartnerOrdersScreen = () => {
  const { newOrders, acceptedOrders, preparingOrders } = usePartnerOrders();
  
  return (
    <Tabs>
      <Tab title="New ({newOrders.length})">
        <OrderList orders={newOrders} type="new" />
      </Tab>
      <Tab title="Accepted">
        <OrderList orders={acceptedOrders} type="accepted" />
      </Tab>
      <Tab title="Preparing">
        <OrderList orders={preparingOrders} type="preparing" />
      </Tab>
    </Tabs>
  );
};
```

## P188 — Partner Quick Actions
```typescript
// One-tap accept/reject
const OrderQuickActions = ({ order }) => (
  <View>
    <Button 
      title="Accept" 
      variant="accept"
      onPress={() => accept(order.id)} 
    />
    <Button 
      title="Reject" 
      variant="reject"
      onPress={() => reject(order.id)} 
    />
    <Button 
      title="Preparing" 
      variant="preparing"
      onPress={() => markPreparing(order.id)} 
    />
    <Button 
      title="Ready" 
      variant="ready"
      onPress={() => markReady(order.id)} 
    />
  </View>
);
```

## P189 — Partner Menu Availability
```typescript
// Bulk toggle items
@Patch('partners/:id/availability')
async updateAvailability(
  @Param('id') partnerId: string,
  @Body() dto: AvailabilityDto
) {
  await this.menuService.bulkUpdate(partnerId, dto.items);
  
  // Clear cache
  await this.cacheService.delete(`menu:${partnerId}`);
  
  // Flush CDN
  await this.cdnService.flush(`menu/${partnerId}`);
}
```

## P190 — Partner Staff Management
```typescript
interface StaffMember {
  id: string;
  partnerId: string;
  name: string;
  email: string;
  phone: string;
  role: 'owner' | 'manager' | 'staff';
  permissions: string[];
  active: boolean;
}
```

## P191 — Partner Payout Settings
```typescript
interface PartnerPayoutSettings {
  partnerId: string;
  payoutSchedule: 'daily' | 'weekly' | 'monthly';
  payoutDay?: number; // For weekly/monthly
  bankAccount: BankAccount;
  payoutThreshold: number;
}
```

## P192 — Partner Invoices
```typescript
const InvoiceScreen = () => {
  const { invoices, download } = usePartnerInvoices();
  
  return (
    <FlatList
      data={invoices}
      renderItem={({ item }) => (
        <InvoiceCard
          invoice={item}
          onDownload={() => download(item.id)}
        />
      )}
    />
  );
};
```

## P193 — Partner Support
```typescript
// Partner FAQ using RAG
const partnerFaqChain = (
  PineconeRetriever(index="partner-knowledge-base")
  | ContextualCompressor()
  | ChatBedrock(model="claude-3")
);
```

## P194 — Partner App Setup (React Native)
```typescript
// Partner tablet app
export const PartnerApp = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Orders" component={OrdersScreen} />
      <Stack.Screen name="Menu" component={MenuScreen} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);
```

## P195 — Partner Tablet Mode
```typescript
// Split view for tablets
const TabletLayout = () => (
  <SplitView>
    <LeftPane>
      <NewOrders />
    </LeftPane>
    <RightPane>
      <OrderDetails order={selectedOrder} />
    </RightPane>
  </SplitView>
);
```

## P196-P210 — Additional Storefront Features
- P196: Partner branding
- P197: Partner custom domain
- P198: Partner loyalty program
- P199: Partner promotions
- P200: Partner marketing tools
- P201: Partner waitlist
- P202: Partner pre-orders
- P203: Partner catering
- P204: Partner events
- P205: Partner dietary filters
- P206: Partner allergen badges
- P207: Partner photos
- P208: Partner videos
- P209: Partner reports export
- P210: Partner API access

---

## Restaurant Storefronts Summary
| Component | Technology |
|-----------|------------|
| Onboarding | Multi-step flow |
| Menu Editor | React Native |
| POS Sync | Python workers |
| Dashboard | React Native |
| Tablet Mode | Split view |
| Analytics | Charts |
| Support | RAG FAQ |

**Phase Group H Complete! Ready for Phase Group I — Customer Experience (P211-P250)**
