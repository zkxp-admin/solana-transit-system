# Subscription Pass System Implementation Guide

## ✅ COMPLETED: Backend (Rust/Solana Program)

### 1. State Structure Updates

#### Passenger Account Extended (src/state/passenger.rs)
**New fields added:**
```rust
pub subscription_type: u8,           // 0=none, 1=monthly, 2=yearly
pub subscription_start: i64,         // Subscription start timestamp
pub subscription_end: i64,           // Subscription expiry timestamp
pub subscription_rides_used: u32,    // Rides used in current subscription period
```
**Account space increased from 61 to 109 bytes**

#### FareConfig Account Extended (src/state/fare_config.rs)
**New fields added:**
```rust
pub monthly_pass_price: u64,          // Price for 30-day subscription
pub yearly_pass_price: u64,           // Price for 365-day subscription
pub total_active_subscriptions: u64,  // Count of active subscriptions
```
**Account space increased from 97 to 145 bytes**

### 2. Error Enum Updated (src/error.rs)
**New error variants:**
- `InvalidSubscriptionType` - Invalid subscription type (must be 1 or 2)
- `SubscriptionAlreadyActive` - User already has an active subscription
- `SubscriptionExpired` - Subscription has expired
- `SubscriptionNotFound` - No active subscription found

### 3. New Instructions Created

#### A. Purchase Subscription (src/instructions/purchase_subscription.rs)
- **Function:** `purchase_subscription(subscription_type: u8)`
- **Parameters:**
  - `subscription_type: 1` = Monthly (30 days)
  - `subscription_type: 2` = Yearly (365 days)
- **Functionality:**
  - Validates subscription type
  - Checks for existing active subscriptions
  - Calculates price based on type
  - Executes SPL token transfer
  - Updates passenger with subscription data
  - Sets subscription_start = current_time
  - Sets subscription_end based on duration
  - Increments total_active_subscriptions counter
- **Account space:** 109 bytes for passenger

#### B. Use Subscription Ride (src/instructions/use_subscription_ride.rs)
- **Function:** `use_subscription_ride()`
- **Functionality:**
  - Validates subscription exists
  - Validates subscription is not expired
  - Increments subscription_rides_used counter
  - No payment required - subscription covers it
  - Simple and lightweight

#### C. Cancel Subscription (src/instructions/cancel_subscription.rs)
- **Function:** `cancel_subscription()`
- **Functionality:**
  - Validates subscription exists
  - Calculates pro-rated refund:
    - Formula: `(remaining_time / total_time) * original_price`
    - Example: Cancel after 15 days of 30-day pass = 50% refund
  - Transfers refund to user
  - Resets subscription fields to default
  - Decrements total_active_subscriptions counter

### 4. Updated Existing Instructions

#### Initialize Fare Config (src/instructions/initialize_fare_config.rs)
**Signature updated:**
```rust
pub fn initialize_fare_config(
    ctx: Context<InitializeFareConfig>,
    mode_0_fare: u64,
    mode_1_fare: u64,
    currency_mint: Pubkey,
    monthly_pass_price: u64,    // NEW
    yearly_pass_price: u64,     // NEW
) -> Result<()>
```

#### Update Fare Config (src/instructions/update_fare_config.rs)
**Signature updated:**
```rust
pub fn update_fare_config(
    ctx: Context<UpdateFareConfig>,
    mode_0_fare: Option<u64>,
    mode_1_fare: Option<u64>,
    monthly_pass_price: Option<u64>,     // NEW
    yearly_pass_price: Option<u64>,      // NEW
) -> Result<()>
```

### 5. Program Entry Point Updated (src/lib.rs)
**Added:**
- Module declarations for instructions, state, and error
- Three new public instruction handlers:
  - `purchase_subscription(subscription_type: u8)`
  - `use_subscription_ride()`
  - `cancel_subscription()`
- Updated `initialize_fare_config` and `update_fare_config` signatures

### 6. Module System (src/instructions/mod.rs, src/state/mod.rs)
**Created:**
- `src/instructions/mod.rs` - Declares all instruction modules
- `src/state/mod.rs` - Declares all state modules

---

## 📋 TODO: Frontend (React/TypeScript)

### Phase 2.1: Update RPC Client (app/solana/client/rpc.ts)

#### Add Types:
```typescript
export type PurchaseSubscriptionArgs = {
  feePayer: web3.PublicKey;
  user: web3.PublicKey;
  userTokenAccount: web3.PublicKey;
  systemTokenAccount: web3.PublicKey;
  currencyMint: web3.PublicKey;
  source: web3.PublicKey;
  mint: web3.PublicKey;
  destination: web3.PublicKey;
  authority: web3.PublicKey;
  subscriptionType: number;
};

export type UseSubscriptionRideArgs = {
  feePayer: web3.PublicKey;
  user: web3.PublicKey;
};

export type CancelSubscriptionArgs = {
  feePayer: web3.PublicKey;
  user: web3.PublicKey;
  userTokenAccount: web3.PublicKey;
  systemTokenAccount: web3.PublicKey;
  currencyMint: web3.PublicKey;
  source: web3.PublicKey;
  mint: web3.PublicKey;
  destination: web3.PublicKey;
  authority: web3.PublicKey;
};
```

#### Add Functions:
- `purchaseSubscriptionBuilder(args: PurchaseSubscriptionArgs) -> MethodsBuilder<TransitFarePayment>`
- `purchaseSubscription(args: PurchaseSubscriptionArgs) -> Promise<TransactionInstruction>`
- `purchaseSubscriptionSendAndConfirm(args: ...) -> Promise<TransactionSignature>`
- `useSubscriptionRideBuilder(args: UseSubscriptionRideArgs) -> MethodsBuilder<TransitFarePayment>`
- `useSubscriptionRide(args: UseSubscriptionRideArgs) -> Promise<TransactionInstruction>`
- `useSubscriptionRideSendAndConfirm(args: ...) -> Promise<TransactionSignature>`
- `cancelSubscriptionBuilder(args: CancelSubscriptionArgs) -> MethodsBuilder<TransitFarePayment>`
- `cancelSubscription(args: CancelSubscriptionArgs) -> Promise<TransactionInstruction>`
- `cancelSubscriptionSendAndConfirm(args: ...) -> Promise<TransactionSignature>`

#### Update Types:
- `InitializeFareConfigArgs` - Add `monthlyPassPrice: bigint` and `yearlyPassPrice: bigint`
- `UpdateFareConfigArgs` - Add optional subscription prices

### Phase 2.2: Create SubscriptionSelection Component

**File:** `app/components/SubscriptionSelection.tsx`

**Props:**
```typescript
interface SubscriptionSelectionProps {
  onPurchase: (subscriptionType: 1 | 2) => void;
  isLoading: boolean;
  monthlyPassPrice: bigint;
  yearlyPassPrice: bigint;
  hasActiveSubscription: boolean;
  subscriptionEnd?: i64;
}
```

**Features:**
- Display Monthly Pass option with pricing
- Display Yearly Pass option with pricing
- Show current subscription status if active
- Display expiry date and days remaining
- Show rides used counter
- Purchase/Renew button
- Cancel subscription button (with confirmation modal)

**UI Layout:**
```
┌─────────────────────────────────────────┐
│       Subscription Pass Selection        │
├─────────────────────────────────────────┤
│ ☑ Monthly Pass (30 days)                │
│   Price: 0.05 SOL                       │
│                                          │
│ ☐ Yearly Pass (365 days)                │
│   Price: 0.50 SOL (Save 17%!)           │
│                                          │
│ [Current Pass: Monthly | Expires in 12d]│
│ [Rides Used: 23/Unlimited]              │
│                                          │
│ [Purchase/Renew Subscription] [Cancel]  │
└─────────────────────────────────────────┘
```

### Phase 2.3: Create SubscriptionStatus Component

**File:** `app/components/SubscriptionStatus.tsx`

**Props:**
```typescript
interface SubscriptionStatusProps {
  subscriptionType: number; // 0=none, 1=monthly, 2=yearly
  subscriptionStart: i64;
  subscriptionEnd: i64;
  ridesUsed: u32;
}
```

**Features:**
- Card showing active subscription details
- Subscription type badge (Monthly/Yearly)
- Expiry date display
- Progress bar showing time remaining
- Rides used counter (if tracking enabled)
- Auto-renewal reminder (when < 7 days remaining)
- Visual indicator of subscription status

**UI Layout:**
```
┌──────────────────────────────────────────┐
│     Active Subscription  ✓                │
├──────────────────────────────────────────┤
│ Monthly Pass                              │
│ Expires: Dec 15, 2024                    │
│ Days Remaining: 12 [████████░░] 40%      │
│ Rides Used: 23 (Unlimited)               │
│                                           │
│ ⚠ Renewal reminder: 7 days remaining    │
└──────────────────────────────────────────┘
```

### Phase 2.4: Update TransitFarePaymentApp

**File:** `app/components/TransitFarePaymentApp.tsx`

**Add State:**
```typescript
const [subscriptionData, setSubscriptionData] = useState({
  subscriptionType: 0,
  subscriptionStart: 0n,
  subscriptionEnd: 0n,
  ridesUsed: 0,
});
const [monthlyPassPrice, setMonthlyPassPrice] = useState(0n);
const [yearlyPassPrice, setYearlyPassPrice] = useState(0n);
```

**Add Functions:**
```typescript
const handlePurchaseSubscription = async (subscriptionType: 1 | 2) => {
  // Call purchaseSubscriptionSendAndConfirm
  // Update subscription data
  // Show success message
};

const handleUseSubscriptionRide = async (transportMode: 0 | 1) => {
  // Call useSubscriptionRideSendAndConfirm if has active subscription
  // Otherwise fall back to ticket purchase
  // Increment rides used counter
};

const handleCancelSubscription = async () => {
  // Show confirmation modal
  // Call cancelSubscriptionSendAndConfirm
  // Update subscription data to none
  // Show pro-rated refund amount
};
```

**Update Layout:**
```typescript
// Add SubscriptionSelection and SubscriptionStatus to the grid
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  <div className="lg:col-span-1 space-y-6">
    <SubscriptionSelection {...props} />
    <SubscriptionStatus {...props} />
  </div>
  <div className="lg:col-span-2 space-y-8">
    <FareSelection {...props} />
    <PaymentHistory {...props} />
    <TreasuryBalance {...props} />
  </div>
</div>
```

### Phase 2.5: Update FareSelection Component

**File:** `app/components/FareSelection.tsx`

**Changes:**
- Add badge/indicator if user has active subscription
- Show "Free with subscription" if active subscription exists
- Allow ticket purchase even with active subscription (mixed usage)
- Modify button text: "Purchase Ticket" or "Use Subscription Ride"

### Phase 2.6: Update PaymentHistory Component

**File:** `app/components/PaymentHistory.tsx`

**Changes:**
- Add subscription purchase records
- Display "Monthly Pass" and "Yearly Pass" payment types
- Show subscription cancellations and refunds
- Filter or categorize payments by type

---

## 📚 TODO: Documentation & Testing

### Phase 3.1: Update README.md

**Add Sections:**

#### Subscription System Overview
- Explain unlimited rides concept
- Compare monthly vs yearly options
- Show pricing structure

#### Subscription Instructions
- `purchase_subscription`
  - Parameters and descriptions
  - Subscription types (1=monthly, 2=yearly)
  - Price calculation
- `use_subscription_ride`
  - How to validate subscription
  - Expiry checking
- `cancel_subscription`
  - Pro-rated refund calculation
  - Example scenarios

#### Subscription Account Updates
- Updated Passenger struct with new fields
- Updated FareConfig struct with pricing
- Space calculations

#### Usage Examples
```typescript
// Purchase Monthly Subscription
const result = await purchaseSubscriptionSendAndConfirm({
  subscriptionType: 1,  // Monthly
  userTokenAccount: userAccount,
  systemTokenAccount: systemAccount,
  // ... other accounts
  signers: {
    feePayer: signer,
    user: userSigner,
    authority: tokenAuthority,
  },
});

// Use Subscription Ride
const result = await useSubscriptionRideSendAndConfirm({
  signers: {
    feePayer: signer,
    user: userSigner,
  },
});

// Cancel Subscription
const result = await cancelSubscriptionSendAndConfirm({
  // ... account and signer info
});
```

### Phase 3.2: Update Tests

**File:** `tests/transit_fare_payment.ts`

**Add Tests:**
1. `Purchase monthly subscription` - Test 30-day subscription
2. `Purchase yearly subscription` - Test 365-day subscription
3. `Prevent duplicate active subscriptions` - Verify error
4. `Use subscription ride` - Validate rides are tracked
5. `Subscription expiry validation` - Check expiration logic
6. `Cancel subscription and verify refund` - Test pro-rated refund
7. `Mixed usage - subscription + ticket purchases` - Verify both work
8. `Pro-rated refund calculations` - Test various cancellation times

---

## 🎯 Key Design Decisions

### Subscription Model
- **Unlimited rides** during subscription period
- **Separate from individual tickets** - users can buy both
- **Auto-revert** to ticket purchases after expiry
- **Pro-rated refunds** for cancellations

### Data Storage
- Subscription data stored in **Passenger account** (extended)
- Pricing stored in **FareConfig account**
- Reduces account overhead compared to separate subscription accounts

### Time Handling
- Uses `Clock::get()?.unix_timestamp` from Solana
- Monthly = 30 days (2,592,000 seconds)
- Yearly = 365 days (31,536,000 seconds)
- Server-side validation prevents expired rides

### Payment Flow
- Same token transfer pattern as ticket purchases
- Pro-rated calculation: `(remaining_seconds / total_seconds) * price`
- Ensures accurate partial refunds

---

## 🚀 Implementation Order

1. ✅ Backend State & Instructions (COMPLETED)
2. ⬜ RPC Client Updates
3. ⬜ React Components (SubscriptionSelection, SubscriptionStatus)
4. ⬜ Update Main App Component
5. ⬜ Update Supporting Components
6. ⬜ Tests & Documentation

---

## 📊 Metrics & Analytics

The system tracks:
- `total_active_subscriptions` - Active subscription count
- `subscription_rides_used` - Rides per subscription period
- `subscription_start/end` - Timestamps for analytics
- `total_spent` - Updated with subscription purchases

This enables:
- Revenue reporting
- Usage analytics
- Churn analysis
- Peak usage identification

---

## ⚠️ Security Considerations

1. **Expiry Validation** - Server-side checks prevent expired ride usage
2. **Authorization** - Only subscribers can use subscription rides
3. **Refund Precision** - Pro-rated calculation prevents over-refunds
4. **Duplicate Prevention** - Can't purchase while subscription is active
5. **Token Safety** - Uses Anchor's transfer_checked for secure transfers

---

## 🔄 Future Enhancements

1. **Dynamic Pricing** - Adjust prices based on demand
2. **Multi-Month Subscriptions** - 3-month, 6-month options
3. **Family Plans** - Multiple users per subscription
4. **Auto-Renewal** - Automatic subscription renewal
5. **Loyalty Rewards** - Bonus rides for yearly subscribers
6. **Suspended Subscriptions** - Pause rather than cancel
7. **Tiered Subscriptions** - Different pass levels
8. **Corporate Plans** - Bulk subscriptions for organizations

