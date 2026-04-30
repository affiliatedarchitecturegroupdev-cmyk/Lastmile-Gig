# Phase Group I — Customer Experience (P211-P250)

## P211 — Customer App Scaffold
```typescript
// React Native + Expo
export const CustomerApp = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Restaurant" component={RestaurantScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Orders" component={OrdersScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);
```

## P212 — Customer Home Screen
```typescript
const HomeScreen = () => {
  const { nearbyRestaurants, cuisineFilters, search } = useHomeData();
  
  return (
    <View>
      <SearchBar onChangeText={search} />
      <CuisineFilters filters={cuisineFilters} />
      <RestaurantList restaurants={nearbyRestaurants} />
    </View>
  );
};
```

## P213 — Restaurant Discovery
```typescript
// Search + filtering
interface RestaurantFilter {
  cuisine?: string[];
  rating?: number;
  deliveryTime?: number;
  priceRange?: string;
  dietary?: string[];
}

const RestaurantSearch = () => {
  const { restaurants, applyFilter, sort } = useSearch();
  
  return (
    <FlatList
      data={restaurants}
      renderItem={({ item }) => (
        <RestaurantCard restaurant={item} />
      )}
    />
  );
};
```

## P214 — Restaurant Detail Page
```typescript
const RestaurantScreen = ({ route }) => {
  const { restaurant, menu, reviews, info } = useRestaurant(route.params.id);
  
  return (
    <ScrollView>
      <RestaurantHeader restaurant={restaurant} />
      <MenuSection menu={menu} />
      <ReviewsSection reviews={reviews} />
      <InfoSection info={info} />
    </ScrollView>
  );
};
```

## P215 — Menu Browsing
```typescript
const MenuSection = ({ menu }) => {
  const { category, items, addItem } = useMenu();
  
  return (
    <View>
      <CategoryTabs categories={menu.categories} />
      <FlatList
        data={items}
        renderItem={({ item }) => (
          <MenuItem item={item} onAdd={addItem} />
        )}
      />
    </View>
  );
};
```

## P216 — Cart Management
```typescript
const CartScreen = () => {
  const { cart, updateQuantity, removeItem, clear } = useCart();
  
  if (cart.isEmpty) return <EmptyCart />;
  
  return (
    <View>
      <FlatList
        data={cart.items}
        renderItem={({ item }) => (
          <CartItem
            item={item}
            onUpdate={updateQuantity}
            onRemove={removeItem}
          />
        )}
      />
      <CartSummary>
        <Text>Subtotal: {cart.subtotal}</Text>
        <Text>Delivery: {cart.deliveryFee}</Text>
        <Text>Total: {cart.total}</Text>
      </CartSummary>
    </View>
  );
};
```

## P217 — Delivery Address
```typescript
const AddressScreen = () => {
  const { savedAddresses, currentLocation, addAddress } = useAddresses();
  
  return (
    <FlatList
      data={savedAddresses}
      renderItem={({ item }) => (
        <AddressCard address={item} />
      )}
    />
  );
};
```

## P218 — Checkout Flow
```typescript
const CheckoutScreen = () => {
  const { order, paymentMethod, placeOrder } = useCheckout();
  
  return (
    <View>
      <OrderSummary order={order} />
      <PaymentMethods methods={paymentMethod} />
      <TipSelection />
      <PlaceOrderButton onPress={placeOrder} />
    </View>
  );
};
```

## P219 — Payment Methods
```typescript
interface PaymentMethod {
  id: string;
  type: 'card' | 'apple_pay' | 'google_pay' | 'cash';
  last4?: string;
  brand?: string;
}

// Stripe integration
const paymentMethods = [
  { type: 'card', required: ['name', 'number', 'expiry', 'cvc'] },
  { type: 'apple_pay' },
  { type: 'google_pay' },
  { type: 'cash' }
];
```

## P220 — Order Confirmation
```typescript
const OrderConfirmation = ({ order }) => (
  <View>
    <SuccessIcon />
    <Text>Order #{order.id}</Text>
    <Text>Confirmed!</Text>
    <Text>ETA: {order.eta}</Text>
    <Text>Total: {order.total}</Text>
  </View>
);
```

## P221 — Customer Order Tracking
```typescript
const OrderTrackingScreen = ({ orderId }) => {
  const { status, location, eta, driver } = useOrderTracking(orderId);
  
  return (
    <MapView>
      <RestaurantMarker />
      <CustomerMarker />
      <DriverMarker location={driver.location} />
      <Route />
    </MapView>
  );
};
```

## P222 — Push Notifications
```typescript
// Order status notifications
await notificationService.send({
  recipient: customerId,
  title: 'Order Confirmed',
  body: 'Your order #12345 has been confirmed'
});

await notificationService.send({
  recipient: customerId,
  title: 'On the way!',
  body: `${driver.name} is bringing your order`
});
```

## P223 — Customer Order History
```typescript
const OrderHistoryScreen = () => {
  const { orders, reorder } = useOrders();
  
  return (
    <FlatList
      data={orders}
      renderItem={({ item }) => (
        <OrderCard order={item} onReorder={reorder} />
      )}
    />
  );
};
```

## P224 — Reorder Functionality
```typescript
@Post('orders/:id/reorder')
async reorder(@Param('id') orderId: string) {
  const original = await this.orderService.get(orderId);
  
  const newOrder = await this.orderService.create({
    partnerId: original.partnerId,
    items: original.items
  });
  
  return { orderId: newOrder.id };
}
```

## P225 — Customer Profile
```typescript
const ProfileScreen = () => {
  const { profile, updateProfile } = useProfile();
  
  return (
    <View>
      <Avatar source={profile.avatar} />
      <Text>{profile.name}</Text>
      <Text>{profile.email}</Text>
      <Button title="Edit" onPress={updateProfile} />
    </View>
  );
};
```

## P226 — Saved Addresses
```typescript
const AddressesScreen = () => {
  const { addresses, add, edit, remove } = useAddresses();
  
  return (
    <FlatList
      data={addresses}
      renderItem={({ item }) => (
        <AddressCard address={item} onEdit={edit} onDelete={remove} />
      )}
    />
  );
};
```

## P227 — Saved Payment Methods
```typescript
const PaymentMethodsScreen = () => {
  const { methods, add, remove } = usePaymentMethods();
  
  return (
    <FlatList
      data={methods}
      renderItem={({ item }) => (
        <PaymentCard method={item} onDelete={remove} />
      )}
    />
  );
};
```

## P228 — Customer Ratings
```typescript
const RatingScreen = ({ orderId }) => {
  const { rate, submit } = useRating(orderId);
  
  return (
    <View>
      <StarRating value={rating} onChange={rate} />
      <TextInput placeholder="Write a review..." />
      <Button title="Submit" onPress={submit} />
    </View>
  );
};
```

## P229 — Customer Support
```typescript
// RAG-powered chat
const supportChain = (
  PineconeRetriever(index="customer-support-kb")
  | ContextualCompressor()
  | ChatBedrock(model="claude-3")
);

const SupportScreen = () => {
  const { messages, sendMessage } = useChat();
  
  return (
    <FlatList data={messages} />
    <TextInput onSend={sendMessage} />
  </View>
  );
};
```

## P230 — Loyalty Points
```typescript
interface LoyaltyAccount {
  customerId: string;
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  lifetimeSpent: number;
}

// Points earning: R1 = 1 point
// Tier thresholds: Bronze 0, Silver 5k, Gold 20k, Platinum 50k

const LoyaltyScreen = () => {
  const { points, tier, history } = useLoyalty();
  
  return (
    <View>
      <PointsCard points={points} tier={tier} />
      <RewardsList history={history} />
    </View>
  );
};
```

## P231 — Rewards Redemption
```typescript
const RewardsScreen = () => {
  const { rewards, redeem } = useRewards();
  
  return (
    <FlatList
      data={rewards}
      renderItem={({ item }) => (
        <RewardCard reward={item} onRedeem={redeem} />
      )}
    />
  );
};
```

## P232 — Referral Program
```typescript
const ReferralScreen = () => {
  const { code, share, rewards } = useReferral();
  
  return (
    <View>
      <ReferralCode code={code} />
      <ShareButton onShare={share} />
      <ReferralHistory rewards={rewards} />
    </View>
  );
};
```

## P233 — Favorites
```typescript
const FavoritesScreen = () => {
  const { favorites, remove } = useFavorites();
  
  return (
    <FlatList
      data={favorites}
      renderItem={({ item }) => (
        <FavoriteCard restaurant={item} onRemove={remove} />
      )}
    />
  );
};
```

## P234 — Dietary Preferences
```typescript
const DietaryPreferences = () => {
  const { preferences, update } = useDietaryPreferences();
  
  return (
    <CheckboxGroup
      options={['vegetarian', 'vegan', 'halal', 'kosher', 'gluten_free']}
      selected={preferences}
      onChange={update}
    />
  );
};
```

## P235 — Allergen Alerts
```typescript
// Highlight allergens in menu
const AllergenBadge = ({ allergens }) => (
  <View>
    {allergens.map(a => (
      <Badge key={a} text={a} />
    ))}
  </View>
);
```

## P236 — Waiting List
```typescript
const WaitlistScreen = ({ restaurantId }) => {
  const { position, leave } = useWaitlist(restaurantId);
  
  if (position === null) {
    return <JoinWaitlistButton />;
  }
  
  return <Text>Your position: {position}</Text>;
};
```

## P237 — Pre-orders
```typescript
const PreorderScreen = () => {
  const { slot, selectSlot, placeOrder } = usePreorder();
  
  return (
    <View>
      <TimeSlots slots={slot} onSelect={selectSlot} />
      <PreorderButton onPress={placeOrder} />
    </View>
  );
};
```

## P238 — Guest Checkout
```typescript
const GuestCheckout = () => {
  const { email, phone, continueAsGuest } = useGuestCheckout();
  
  return (
    <View>
      <Input label="Email" value={email} />
      <Input label="Phone" value={phone} />
      <Button title="Continue" onPress={continueAsGuest} />
    </View>
  );
};
```

## P239 — Social Login
```typescript
// Auth0 social login
const socialProviders = ['google', 'facebook', 'apple'];
```

## P240 — Customer Onboarding
```typescript
const OnboardingScreen = () => (
  <Onboarding>
    <Slide title="Order food" image={...} />
    <Slide title="Track delivery" image={...} />
    <Slide title="Earn rewards" image={...} />
  </Onboarding>
);
```

## P241-P250 — Additional Customer Features
- P241: Push notification preferences
- P242: Email preferences
- P243: Dark mode
- P244: Language selection
- P245: Accessibility
- P246: Location permissions
- P247: Privacy settings
- P248: Account deletion
- P249: Export data
- P250: Family sharing

---

## Customer Experience Summary
| Component | Technology |
|-----------|------------|
| App | React Native + Expo |
| Discovery | Elasticsearch |
| Cart | Redis, DynamoDB |
| Payments | Stripe |
| Tracking | WebSocket |
| Loyalty | Supabase |
| Support | RAG FAQ |

**Phase Group I Complete! Ready for Phase Group J — AI Agentic Layer (P251-P290)**
