# Solana Transit Fare Payment System

A decentralized transit fare payment system built on the Solana blockchain. This program enables trustless ticketing for public transportation by leveraging smart contracts and SPL tokens for fare payments.

## Overview

The Transit Fare Payment System is a Solana-based smart contract application that allows users to purchase transit tickets using blockchain technology. It supports configurable pricing for different transport modes and provides transparent, immutable payment records on-chain.

### Key Features

- **Decentralized Ticketing**: Purchase and validate transit tickets directly on the Solana blockchain
- **Multiple Transport Modes**: Support for different transport modes (e.g., Mode 0 and Mode 1) with configurable pricing
- **SPL Token Payments**: All fares are paid using configurable SPL tokens
- **Web3 Wallet Integration**: Full support for Phantom, Solflare, and other Solana wallet adapters
- **Transparent Pricing**: Admin-controlled fare configuration with real-time price updates
- **Immutable Records**: All transactions recorded permanently on-chain for audit trails
- **Refund Processing**: Users can refund unused tickets to reclaim their payment
- **Passenger Analytics**: On-chain tracking of spending history and ticket purchases per passenger
- **Subscription Passes**: Monthly and yearly subscription options for frequent travelers with unlimited rides
- **Pro-Rated Refunds**: Cancel subscriptions anytime and receive a pro-rated refund for unused time
- **Mixed Usage**: Subscription holders can also purchase individual tickets when needed

## Project Structure

```
transit_fare_payment_program/
├── programs/
│   └── transit_fare_payment/          # Solana program (Smart Contract)
│       ├── src/
│       │   ├── instructions/          # Program instructions
│       │   │   ├── initialize_fare_config.rs
│       │   │   ├── update_fare_config.rs
│       │   │   ├── purchase_ticket.rs
│       │   │   ├── use_ticket.rs
│       │   │   ├── refund_ticket.rs
│       │   │   ├── record_payment.rs
│       │   │   └── mod.rs
│       │   ├── state/                 # Program state structures
│       │   │   ├── fare_config.rs
│       │   │   ├── ticket.rs
│       │   │   ├── payment.rs
│       │   │   ├── passenger.rs
│       │   │   └── mod.rs
│       │   ├── lib.rs                 # Program entry point
│       │   ├── error.rs               # Error definitions
│       │   └── constants.rs           # Program constants
│       ├── Cargo.toml
│       └── Xargo.toml
├── app/                                # React frontend application
│   ├── components/
│   │   ├── TransitFarePaymentApp.tsx  # Main application component
│   │   ├── FareSelection.tsx          # Fare selection UI
│   │   ├── PaymentHistory.tsx         # Payment history display
│   │   ├── TreasuryBalance.tsx        # Treasury balance display
│   │   └── Header.tsx                 # Header component
│   ├── solana/
│   │   ├── client/                    # Solana client utilities
│   │   │   ├── rpc.ts                 # RPC client functions
│   │   │   ├── pda.ts                 # PDA derivation functions
│   │   │   └── index.ts
│   │   ├── useProgram.ts              # Program hook
│   │   ├── programId.ts               # Program ID configuration
│   │   └── SolanaProvider.tsx          # Solana context provider
│   ├── routes/
│   │   ├── home.tsx
│   │   └── docs.tsx
│   ├── root.tsx
│   ├── routes.ts
│   └── app.css
├── tests/                              # Test files
│   └── transit_fare_payment.ts
├── migrations/
│   └── deploy.ts
├── package.json
├── Cargo.toml
├── Anchor.toml
└── README.md
```

## Core Functionality

### 1. Fare Configuration Management

Initialize and manage transit fare prices for different transport modes.

**Instructions:**
- `initialize_fare_config`: Set up initial fare prices for Mode 0 and Mode 1
- `update_fare_config`: Update fare amounts for one or both transport modes

**Parameters:**
- `mode_0_fare`: Fare amount for transport mode 0 (in base tokens)
- `mode_1_fare`: Fare amount for transport mode 1 (in base tokens)
- `currency_mint`: SPL token mint address used for payments

### 2. Ticket Purchase System

Users can purchase transit tickets by paying the configured fare in SPL tokens.

**Instruction:** `purchase_ticket`

**Parameters:**
- `transport_mode`: Transport mode (0 or 1)
- `ticket_id`: Unique identifier for the ticket
- `amount`: Payment amount (must match the configured fare)

**Features:**
- Automatic passenger account creation
- Token transfer from user to system
- Ticket status tracking (unused/used)

### 3. Ticket Validation

Validate and mark tickets as used when boarding a transit vehicle.

**Instruction:** `use_ticket`

**Features:**
- Prevent ticket reuse
- Status update to "used" (status = 1)
- Prevents double-spending of tickets

### 4. Refund Processing

Enable users to request refunds for unused tickets.

**Instruction:** `refund_ticket`

**Features:**
- Refund only to unused tickets
- Token return to user's account
- Automatic passenger statistics update
- Account closure after refund

### 5. Payment Recording

Log payment transactions on-chain for audit trails.

**Instruction:** `record_payment`

**Parameters:**
- `payment_id`: Unique payment identifier
- `amount`: Payment amount
- `currency_mint`: Currency used
- `transaction_hash`: External transaction reference

## Account Types

### FareConfig
- `admin`: Administrator public key
- `mode_0_fare`: Transport mode 0 fare amount
- `mode_1_fare`: Transport mode 1 fare amount
- `currency_mint`: SPL token mint address
- `total_tickets_sold`: Total tickets issued by the system
- `bump`: Bump seed for PDA derivation

### Passenger
- `user`: User's wallet public key
- `total_spent`: Total amount spent on tickets
- `ticket_count`: Number of tickets purchased
- `last_ticket_timestamp`: Unix timestamp of last purchase
- `bump`: Bump seed for PDA derivation

### Ticket
- `user`: Ticket owner's public key
- `ticket_id`: Unique ticket identifier
- `transport_mode`: Transport mode (0 or 1)
- `fare_amount`: Amount paid for the ticket
- `purchase_timestamp`: Unix timestamp of purchase
- `status`: Ticket status (0 = unused, 1 = used)
- `bump`: Bump seed for PDA derivation

### Payment
- `user`: Payment initiator's public key
- `payment_id`: Unique payment identifier
- `amount`: Payment amount
- `currency_mint`: Currency mint used
- `transaction_hash`: External transaction reference
- `timestamp`: Unix timestamp of payment
- `bump`: Bump seed for PDA derivation

## Program ID

Current Program ID: `FQB354YeYLHky7omGhQXQxQ2QBcuYLq2QXiF4gdVogJt`

## Technology Stack

### Backend
- **Framework**: Anchor Framework for Solana
- **Language**: Rust
- **Blockchain**: Solana

### Frontend
- **Framework**: React 19
- **Router**: React Router 7
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Web3**: Solana Web3.js, Solana Wallet Adapter

### Dependencies
- `@coral-xyz/anchor`: Solana program framework
- `@solana/web3.js`: Solana JavaScript SDK
- `@solana/wallet-adapter-react`: Wallet integration
- `borsh`: Serialization library

## Installation & Setup

### Prerequisites
- Node.js (v18+)
- Rust toolchain
- Solana CLI
- Anchor CLI (`npm install -g @coral-xyz/anchor`)

### Build Instructions

1. **Build the Solana Program**
   ```bash
   cd programs/transit_fare_payment
   cargo build-bpf
   ```

2. **Deploy the Program** (requires active Solana config)
   ```bash
   anchor deploy
   ```

3. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   ```

## Usage Examples

### Initialize Fare Configuration

```typescript
import { initializeFareConfigSendAndConfirm } from './app/solana/client/rpc';

const result = await initializeFareConfigSendAndConfirm({
  mode0Fare: BigInt(5000000),    // 0.005 SOL
  mode1Fare: BigInt(10000000),   // 0.01 SOL
  currencyMint: new PublicKey('EPjFWaLb3odcccccccccccccccccccccccccccccc'),
  signers: {
    feePayer: signer,
    admin: adminSigner,
  },
});
```

### Purchase a Transit Ticket

```typescript
import { purchaseTicketSendAndConfirm } from './app/solana/client/rpc';

const result = await purchaseTicketSendAndConfirm({
  transportMode: 0,
  ticketId: BigInt(1),
  amount: BigInt(5000000),  // 0.005 SOL
  userTokenAccount: userTokenAccount,
  systemTokenAccount: systemTokenAccount,
  source: userTokenSource,
  destination: systemTokenDest,
  // ... other required accounts
  signers: {
    feePayer: signer,
    user: userSigner,
    authority: tokenAuthority,
  },
});
```

### Use a Ticket

```typescript
import { useTicketSendAndConfirm } from './app/solana/client/rpc';

const result = await useTicketSendAndConfirm({
  ticketId: BigInt(1),
  signers: {
    feePayer: signer,
    user: userSigner,
  },
});
```

## Subscription System

The system includes a comprehensive subscription pass system for frequent travelers.

### Subscription Features

- **Monthly Pass**: 30-day unlimited transit access
- **Yearly Pass**: 365-day unlimited transit access (better value)
- **Unlimited Rides**: No limit on transit usage during subscription period
- **Pro-Rated Refunds**: Cancel anytime and receive refund for unused time
- **Mixed Usage**: Subscribers can also purchase individual tickets
- **Auto-Revert**: After expiry, automatically fall back to ticket purchases

### Purchase a Subscription

```typescript
import { purchaseSubscriptionSendAndConfirm } from './app/solana/client/rpc';

// Purchase monthly subscription (1 = monthly, 2 = yearly)
const result = await purchaseSubscriptionSendAndConfirm({
  subscriptionType: 1,  // Monthly pass
  userTokenAccount: userTokenAccount,
  systemTokenAccount: systemTokenAccount,
  currencyMint: new PublicKey('EPjFWaLb3odcccccccccccccccccccccccccccccc'),
  source: userTokenSource,
  destination: systemTokenDest,
  // ... other required accounts
  signers: {
    feePayer: signer,
    user: userSigner,
    authority: tokenAuthority,
  },
});
```

### Use Subscription Ride

```typescript
import { useSubscriptionRideSendAndConfirm } from './app/solana/client/rpc';

const result = await useSubscriptionRideSendAndConfirm({
  signers: {
    feePayer: signer,
    user: userSigner,
  },
});
```

### Cancel Subscription

```typescript
import { cancelSubscriptionSendAndConfirm } from './app/solana/client/rpc';

// Cancel and receive pro-rated refund
const result = await cancelSubscriptionSendAndConfirm({
  userTokenAccount: userTokenAccount,
  systemTokenAccount: systemTokenAccount,
  currencyMint: currencyMint,
  source: systemTokenSource,
  destination: userTokenDest,
  // ... other required accounts
  signers: {
    feePayer: signer,
    user: userSigner,
    authority: tokenAuthority,
  },
});
```

### Subscription Instructions

#### purchase_subscription
- **Type**: 1 (monthly) or 2 (yearly)
- **Duration**: Monthly = 30 days, Yearly = 365 days
- **Effect**: Creates/updates subscription in Passenger account
- **Requirements**: No active subscription, sufficient balance for payment
- **Returns**: Transaction signature confirming subscription

#### use_subscription_ride
- **Prerequisites**: Active non-expired subscription
- **Effect**: Increments rides_used counter (for analytics)
- **Cost**: Free (covered by subscription)
- **Returns**: Transaction signature confirming ride usage

#### cancel_subscription
- **Prerequisites**: Active subscription
- **Effect**: Resets subscription to inactive status
- **Refund**: Pro-rated amount based on remaining time
- **Formula**: `(remaining_seconds / total_seconds) * subscription_price`
- **Example**: Cancel 15 days into 30-day monthly pass = ~50% refund

## Error Handling

The program defines a `FarePaymentError` enum with the following error codes:

### Ticket Errors
- `InvalidTransportMode`: Invalid transport mode provided
- `InvalidAmount`: Payment amount doesn't match configured fare
- `TicketAlreadyUsed`: Attempting to use or refund an already-used ticket

### Subscription Errors
- `InvalidSubscriptionType`: Invalid subscription type (must be 1 for monthly or 2 for yearly)
- `SubscriptionAlreadyActive`: User already has an active subscription (can't purchase another)
- `SubscriptionExpired`: Subscription has expired (cannot use expired subscription)
- `SubscriptionNotFound`: No active subscription found (attempting to use when none exists)

### General Errors
- `Unauthorized`: User lacks permissions for the operation
- `InsufficientFunds`: User lacks sufficient balance for payment
- `InvalidAccountData`: Account data is malformed or invalid

## Development

### Testing

Run tests with:
```bash
npm run test
```

### Code Quality

Format code:
```bash
npm run format
```

Type checking:
```bash
npm run typecheck
```

## Contributing

Contributions are welcome! Please ensure all tests pass and code is properly formatted before submitting pull requests.

## License

MIT License

## Future Enhancements

- Multi-signature authentication for admin operations
- Integration with external payment gateways
- Mobile application support
- Analytics dashboard for transit operators
- NFT-based ticket system
- Subscription/pass system for frequent travelers
