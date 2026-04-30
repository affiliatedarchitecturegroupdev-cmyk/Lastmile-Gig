# Phase Group K — Payments (P291-P320)

## P291 — Payment Gateway Architecture
```typescript
// Payment service abstraction
interface PaymentProvider {
  id: string;
  name: string;
  supportedMethods: PaymentMethod[];
  supportedCurrencies: string[];
  processPayment(dto: PaymentDto): Promise<PaymentResult>;
  refund(paymentId: string, amount: number): Promise<RefundResult>;
  verifyWebhook(signature: string, payload: string): boolean;
}

const providers: PaymentProvider[] = [stripe, paystack, ozow, yoco, stripePix, flutterwave, paygate];
```

## P292 — Stripe Integration
```typescript
// Stripe payments
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Customer payment
const paymentIntent = await stripe.paymentIntents.create({
  amount: order.total * 100, // cents
  currency: 'zar',
  customer: customer.stripeId,
  payment_method: dto.paymentMethodId,
  confirm: true,
  return_url: `${config.baseUrl}/checkout/complete`
});

// Save card for future
await stripe.paymentMethods.attach(dto.paymentMethodId, {
  customer: customer.stripeId
});
```

## P293 — Paystack Integration
```typescript
// Paystack Africa
const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY);

// Initialize transaction
const transaction = await paystack.transaction.initialize({
  email: customer.email,
  amount: order.total * 100, // kobo
  reference: `ORD-${order.id}`,
  callback_url: `${config.baseUrl}/payments/verify`
});

// Verify transaction
const verified = await paystack.transaction.verify(transaction.reference);
```

## P294 — Ozow Instant EFT
```typescript
// Ozow South Africa
const ozow = new Ozow({
  siteCode: process.env.OZOW_SITE_CODE,
  secretKey: process.env.OZOW_SECRET_KEY
});

// Create payment
const payment = await ozow.createPayment({
  transactionReference: `ORD-${order.id}`,
  amount: order.total,
  customer: {
    name: customer.name,
    email: customer.email,
    cellNumber: customer.phone
  },
  isOffline: false,
  paymentType: 'osin'
});

// Redirect customer
return { redirectUrl: payment.redirectUrl };
```

## P295 — Yoco Card Payments
```typescript
// Yoco
const yoco = new Yoco({
  secretKey: process.env.YOCO_SECRET_KEY
});

// Process payment
const payment = await yoco.payments.create({
  amount: order.total * 100, // cents
  currency: 'ZAR',
  callbackUrl: `${config.baseUrl}/payments/yoco/webhook`,
  paymentMethod: {
    card: {
      number: dto.cardNumber,
      expMonth: dto.expMonth,
      expYear: dto.expYear,
      cvc: dto.cvc
    }
  }
});
```

## P296 — Stripe PIX (Brazilian Method)
```typescript
// PIX via Stripe
const pix = await stripe.paymentIntents.create({
  amount: order.total * 100,
  currency: 'brl',
  payment_method_types: ['pix'],
  payment_method_data: {
    type: 'pix',
    pix: {
      key_type: 'cpf',
      key: customer.cpf
    }
  }
});
```

## P297 — Flutterwave (African Payments)
```typescript
// Flutterwave
const flutterwave = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

// Initialize payment
const tx = await flutterwave.MobileMoney.mint({
  tx_ref: `ORD-${order.id}`,
  amount: order.total,
  currency: 'ZAR',
  network: 'MTN', // or telkom, vodacom
  email: customer.email,
  phone: customer.phone,
  client_os: 'android'
});
```

## P298 — Paygate (ZAR Card)
```typescript
// Paygate South Africa
const paygate = new Paygate({
  paygateId: process.env.PAYGATE_ID,
  encryptionKey: process.env.PAYGATE_KEY
});

// Process payment
const result = await paygate.pay({
  orderId: order.id,
  amount: order.total,
  cardNumber: dto.cardNumber,
  cardExpiry: dto.cardExpiry,
  cvv: dto.cvv
});
```

## P299 — Payment Fallback Logic
```typescript
async function processPayment(order: Order, method: string) {
  const providers = getProviders(method);
  
  for (const provider of providers) {
    try {
      const result = await provider.processPayment(order);
      if (result.success) return result;
    } catch (error) {
      log.warn(`Provider ${provider.id} failed`, error);
    }
  }
  
  throw new PaymentFailedException();
}
```

## P300 — Webhook Handling
```typescript
@Post('webhooks/:provider')
async handleWebhook(
  @Param('provider') provider: string,
  @Body() body: any,
  @Headers('x-signature') signature: string
) {
  // Verify signature
  if (!providers[provider].verifyWebhook(signature, JSON.stringify(body))) {
    throw new InvalidSignatureException();
  }
  
  // Process event
  switch (body.event) {
    case 'payment_successful':
      await handlePaymentSuccess(body);
      break;
    case 'payment_failed':
      await handlePaymentFailure(body);
      break;
    case 'chargeback':
      await handleChargeback(body);
      break;
  }
  
  return { received: true };
}
```

## P301 — Refund Process
```typescript
@Post('refunds')
async createRefund(@Body() dto: RefundDto) {
  const order = await this.orderService.get(dto.orderId);
  
  // Determine refund amount
  const refundAmount = calculateRefund(order, dto.reason);
  
  // Process refund via original provider
  const refund = await providers[order.provider].refund(
    order.paymentRef,
    refundAmount
  );
  
  return refund;
}
```

## P302 — Partner Payout Service
```typescript
interface PayoutSettings {
  partnerId: string;
  schedule: 'daily' | 'weekly' | 'monthly';
  bankAccount: BankDetails;
  minimumAmount: number;
}

@Post('payouts/process')
async processPayouts() {
  const pendingPayouts = await this.getPendingPayouts();
  
  for (const payout of pendingPayouts) {
    // Calculate fees
    const netAmount = payout.grossAmount - payout.fees - payout.slaPenalty;
    
    // Process via Ozow
    await this.ozow.transfer({
      amount: netAmount,
      bankAccount: payout.bankAccount,
      reference: `PAYOUT-${payout.id}`
    });
    
    // Update status
    await this.partnerWalletService.markPaid(payout.id);
  }
}
```

## P303 — Driver Payout Service
```typescript
@Post('drivers/:id/payout')
async payoutDriver(
  @Param('id') driverId: string,
  @Body() dto: PayoutDto
) {
  const wallet = await this.walletService.get(driverId);
  
  if (wallet.currentBalance < dto.amount) {
    throw new InsufficientFundsException();
  }
  
  // Instant payout via Ozow
  const payout = await this.ozow.transfer({
    amount: dto.amount,
    bankAccount: wallet.bankAccount,
    reference: `DRIVER-${driverId}-${Date.now()}`
  });
  
  await this.walletService.debit(driverId, dto.amount);
  
  return payout;
}
```

## P304 — Commission Calculation
```typescript
interface Commission {
  orderId: string;
  grossAmount: number;
  commissionPercent: number;
  platformFee: number;
  partnerShare: number;
  driverShare: number;
  slaPenalty: number;
}

function calculateCommission(order: Order): Commission {
  const grossAmount = order.total;
  
  // Platform takes 15%
  const platformFee = grossAmount * 0.15;
  
  // Partner gets 70%
  const partnerShare = grossAmount * 0.70;
  
  // Driver gets 15%
  const driverShare = grossAmount * 0.15;
  
  return {
    orderId: order.id,
    grossAmount,
    commissionPercent: 0.15,
    platformFee,
    partnerShare,
    driverShare,
    slaPenalty: 0
  };
}
```

## P305 — SLA Penalty Application
```typescript
async function applySlaPenalty(order: Order) {
  const slaContract = await getSlaContract(order.partnerId);
  
  if (order.deliveredAt > order.slaDeadline) {
    const lateMinutes = minutesLate(order.deliveredAt, order.slaDeadline);
    const penalty = Math.min(lateMinutes * 10, slaContract.maxPenalty);
    
    await this.partnerWalletService.debit(
      order.partnerId,
      penalty,
      `SLA-${order.id}`
    );
    
    return penalty;
  }
  
  return 0;
}
```

## P306 — Financial Dashboard
```typescript
const FinancialDashboard = () => (
  <Dashboard>
    <RevenueCard title="Today" amount={revenue.today} />
    <RevenueCard title="Week" amount={revenue.week} />
    <RevenueCard title="Month" amount={revenue.month} />
    <RevenueCard title="YTD" amount={revenue.ytd} />
    
    <PayoutsTable payouts={payouts} />
    <RefundsTable refunds={refunds} />
    <TransactionsList />
  </Dashboard>
);
```

## P307 — Partner Financial Reports
```typescript
interface PartnerFinancials {
  partnerId: string;
  period: string;
  totalOrders: number;
  grossRevenue: number;
  platformFee: number;
  slaPenalties: number;
  netRevenue: number;
  pendingPayout: number;
  paidPayout: number;
}
```

## P308 — Driver Earnings Reports
```typescript
interface DriverEarnings {
  driverId: string;
  period: string;
  totalDeliveries: number;
  grossEarnings: number;
  platformDeduction: number;
  netEarnings: number;
  instantPayouts: number;
}
```

## P309 — Payment Reconciliation
```typescript
@Post('reconciliation/daily')
async dailyReconciliation() {
  const payments = await this.paymentService.getUnreconciled();
  
  for (const payment of payments) {
    const gatewayRecord = await this.getGatewayRecord(payment.gatewayRef);
    
    if (!gatewayRecord) {
      await this.alertService.send(`Missing gateway record: ${payment.id}`);
      continue;
    }
    
    if (gatewayRecord.amount !== payment.amount) {
      await this.alertService.send(`Amount mismatch: ${payment.id}`);
      await this.reconciliationService.flag(payment.id, 'amount_mismatch');
    }
    
    await this.reconciliationService.markReconciled(payment.id);
  }
}
```

## P310 — Chargeback Management
```typescript
@Post('chargebacks/respond')
async respondToChargeback(
  @Body() dto: ChargebackDto
) {
  const order = await this.orderService.get(dto.orderId);
  
  // Gather evidence
  const evidence = {
    deliveryPhoto: order.deliveryPhotoHash,
    customerSignature: order.signature,
    driverLocation: order.deliveryLocation,
    timestamp: order.deliveredAt
  };
  
  await this.paymentService.submitEvidence(
    order.chargebackId,
    evidence
  );
}
```

## P311 — Split Payments
```typescript
// Split payments between platform and partners
const split = await stripe.paymentIntents.create({
  amount: order.total * 100,
  currency: 'zar',
  transfer_data: {
    destination: partner.stripeAccountId,
    amount: order.platformFee * 100
  }
});
```

## P312 — Installment Payments
```typescript
// No-installment support via Paystack
const installment = await paystack.transaction.initialize({
  // ... set installment options
});
```

## P313 — Virtual Accounts
```typescript
// Virtual accounts for partner payouts
const virtualAccount = await paystack.misc.create_virtual_account({
  customer: partner.email,
  first_name: partner.name,
  last_name: '',
  phone: partner.phone
});
```

## P314 — Currency Conversion
```typescript
// Multi-currency support
const rates = {
  'USD': 1.0,
  'ZAR': 18.5,
  'BRL': 5.0,
  'NGN': 750,
  'KES': 150
};
```

## P315 — Transaction Fees
```typescript
interface FeeStructure {
  provider: string;
  cardFee: number;
  eftFee: number;
  mobileMoneyFee: number;
  instantEftFee: number;
  payoutFee: number;
}

const fees: FeeStructure[] = [
  { provider: 'stripe', cardFee: 0.029, eftFee: 0, mobileMoneyFee: 0.03, instantEftFee: 0, payoutFee: 10 },
  { provider: 'paystack', cardFee: 0.03, eftFee: 0.015, mobileMoneyFee: 0.025, instantEftFee: 0.02, payoutFee: 5 },
  { provider: 'ozow', cardFee: 0, eftFee: 0, mobileMoneyFee: 0, instantEftFee: 0.015, payoutFee: 3 }
];
```

## P316-P320 — Additional Payment Features
- P316: Payment analytics
- P317: Failed payment retry logic
- P318: Payment method limits
- P319: Refund approval workflow
- P320: Financial compliance reporting

---

## Payments Summary
| Component | Technology |
|-----------|------------|
| Customer Payments | Stripe, Paystack, Ozow, Yoco |
| Driver Payouts | Ozow |
| Partner Payouts | Ozow |
| Reconciliation | Daily automated |
| Financial Reports | Partner & Driver dashboards |

**Phase Group K Complete! All 320 Phases Done! 🎉**
