use anchor_lang::prelude::*;
use std::str::FromStr;

declare_id!("FQB354YeYLHky7omGhQXQxQ2QBcuYLq2QXiF4gdVogJt");

// Module declarations
mod error;
mod instructions;
mod state;

pub use error::*;
pub use instructions::*;
pub use state::*;

#[program]
pub mod transit_fare_payment {
    use super::*;

    /// Initialize the fare configuration with default values
    ///
    /// Accounts:
    /// 0. `[writable, signer]` fee_payer: [AccountInfo] 
    /// 1. `[writable]` fare_config: [FareConfig] 
    /// 2. `[signer]` admin: [AccountInfo] Administrator account
    /// 3. `[]` system_program: [AccountInfo] Auto-generated, for account initialization
    ///
    /// Data:
    /// - mode_0_fare: [u64] Default transport mode 0 fare amount
    /// - mode_1_fare: [u64] Default transport mode 1 fare amount
    /// - currency_mint: [Pubkey] Currency mint address
    pub fn initialize_fare_config(ctx: Context<InitializeFareConfig>, mode_0_fare: u64, mode_1_fare: u64, currency_mint: Pubkey, monthly_pass_price: u64, yearly_pass_price: u64) -> Result<()> {
        initialize_fare_config::handler(ctx, mode_0_fare, mode_1_fare, currency_mint, monthly_pass_price, yearly_pass_price)
    }

    /// Update transit fare configuration settings
    ///
    /// Accounts:
    /// 0. `[writable, signer]` fee_payer: [AccountInfo]
    /// 1. `[writable]` fare_config: [FareConfig]
    /// 2. `[signer]` admin: [AccountInfo] Administrator account
    ///
    /// Data:
    /// - mode_0_fare: [Option<u64>] New transport mode 0 fare amount (optional)
    /// - mode_1_fare: [Option<u64>] New transport mode 1 fare amount (optional)
    pub fn update_fare_config(ctx: Context<UpdateFareConfig>, mode_0_fare: Option<u64>, mode_1_fare: Option<u64>, monthly_pass_price: Option<u64>, yearly_pass_price: Option<u64>) -> Result<()> {
        update_fare_config::handler(ctx, mode_0_fare, mode_1_fare, monthly_pass_price, yearly_pass_price)
    }

    /// Purchase a transit ticket for any transport mode
    ///
    /// Accounts:
    /// 0. `[writable, signer]` fee_payer: [AccountInfo]
    /// 1. `[]` fare_config: [FareConfig] Fare configuration account
    /// 2. `[writable]` passenger: [Passenger]
    /// 3. `[writable]` ticket: [Ticket]
    /// 4. `[signer]` user: [AccountInfo] User's wallet address
    /// 5. `[writable]` user_token_account: [AccountInfo] User's token account for payment
    /// 6. `[writable]` system_token_account: [AccountInfo] System's token account for receiving payment
    /// 7. `[]` currency_mint: [Mint] Currency mint address
    /// 8. `[]` system_program: [AccountInfo] Auto-generated, for account initialization
    /// 9. `[writable]` source: [AccountInfo] The source account.
    /// 10. `[]` mint: [Mint] The token mint.
    /// 11. `[writable]` destination: [AccountInfo] The destination account.
    /// 12. `[signer]` authority: [AccountInfo] The source account's owner/delegate.
    /// 13. `[]` token_program: [AccountInfo] Auto-generated, TokenProgram
    ///
    /// Data:
    /// - transport_mode: [u8] Transport mode (0 or 1)
    /// - ticket_id: [u64] Unique ticket identifier
    /// - amount: [u64] Amount to pay for the ticket
    pub fn purchase_ticket(ctx: Context<PurchaseTicket>, transport_mode: u8, ticket_id: u64, amount: u64) -> Result<()> {
        purchase_ticket::handler(ctx, transport_mode, ticket_id, amount)
    }

    /// Mark a ticket as used for travel
    ///
    /// Accounts:
    /// 0. `[writable, signer]` fee_payer: [AccountInfo] 
    /// 1. `[writable]` ticket: [Ticket] 
    /// 2. `[signer]` user: [AccountInfo] User's wallet address
    ///
    /// Data:
    /// - ticket_id: [u64] Ticket identifier
    pub fn use_ticket(ctx: Context<UseTicket>, ticket_id: u64) -> Result<()> {
        use_ticket::handler(ctx, ticket_id)
    }

    /// Refund a ticket and return funds to user
    ///
    /// Accounts:
    /// 0. `[writable, signer]` fee_payer: [AccountInfo] 
    /// 1. `[]` fare_config: [FareConfig] Fare configuration account
    /// 2. `[writable]` passenger: [Passenger] 
    /// 3. `[writable]` ticket: [Ticket] 
    /// 4. `[signer]` user: [AccountInfo] User's wallet address
    /// 5. `[writable]` user_token_account: [AccountInfo] User's token account for refund
    /// 6. `[writable]` system_token_account: [AccountInfo] System's token account for refund
    /// 7. `[]` currency_mint: [Mint] Currency mint address
    /// 8. `[writable]` source: [AccountInfo] The source account.
    /// 9. `[]` mint: [Mint] The token mint.
    /// 10. `[writable]` destination: [AccountInfo] The destination account.
    /// 11. `[signer]` authority: [AccountInfo] The source account's owner/delegate.
    /// 12. `[]` token_program: [AccountInfo] Auto-generated, TokenProgram
    ///
    /// Data:
    /// - ticket_id: [u64] Ticket identifier
    pub fn refund_ticket(ctx: Context<RefundTicket>, ticket_id: u64) -> Result<()> {
        refund_ticket::handler(ctx, ticket_id)
    }

    /// Record a payment transaction
    ///
    /// Accounts:
    /// 0. `[writable, signer]` fee_payer: [AccountInfo] 
    /// 1. `[writable]` payment: [Payment] 
    /// 2. `[signer]` user: [AccountInfo] User's wallet address
    /// 3. `[]` system_program: [AccountInfo] Auto-generated, for account initialization
    ///
    /// Data:
    /// - payment_id: [u64] Unique payment identifier
    /// - amount: [u64] Payment amount
    /// - currency_mint: [Pubkey] Currency mint address
    /// - transaction_hash: [String] Transaction hash for reference
    pub fn record_payment(ctx: Context<RecordPayment>, payment_id: u64, amount: u64, currency_mint: Pubkey, transaction_hash: String) -> Result<()> {
        record_payment::handler(ctx, payment_id, amount, currency_mint, transaction_hash)
    }

    /// Purchase a subscription pass for transit travel
    ///
    /// Accounts:
    /// 0. `[writable, signer]` fee_payer: [AccountInfo]
    /// 1. `[]` fare_config: [FareConfig] Fare configuration account
    /// 2. `[writable]` passenger: [Passenger]
    /// 3. `[signer]` user: [AccountInfo] User's wallet address
    /// 4. `[writable]` user_token_account: [AccountInfo] User's token account for payment
    /// 5. `[writable]` system_token_account: [AccountInfo] System's token account for receiving payment
    /// 6. `[]` currency_mint: [Mint] Currency mint address
    /// 7. `[]` system_program: [AccountInfo] Auto-generated, for account initialization
    /// 8. `[writable]` source: [AccountInfo] The source account.
    /// 9. `[]` mint: [Mint] The token mint.
    /// 10. `[writable]` destination: [AccountInfo] The destination account.
    /// 11. `[signer]` authority: [AccountInfo] The source account's owner/delegate.
    /// 12. `[]` token_program: [AccountInfo] Auto-generated, TokenProgram
    ///
    /// Data:
    /// - subscription_type: [u8] Subscription type (1=monthly, 2=yearly)
    pub fn purchase_subscription(ctx: Context<PurchaseSubscription>, subscription_type: u8) -> Result<()> {
        purchase_subscription::handler(ctx, subscription_type)
    }

    /// Use a subscription ride for transit travel
    ///
    /// Accounts:
    /// 0. `[writable, signer]` fee_payer: [AccountInfo]
    /// 1. `[writable]` passenger: [Passenger]
    /// 2. `[signer]` user: [AccountInfo] User's wallet address
    ///
    /// Data: None
    pub fn use_subscription_ride(ctx: Context<UseSubscriptionRide>) -> Result<()> {
        use_subscription_ride::handler(ctx)
    }

    /// Cancel an active subscription and process pro-rated refund
    ///
    /// Accounts:
    /// 0. `[writable, signer]` fee_payer: [AccountInfo]
    /// 1. `[writable]` fare_config: [FareConfig] Fare configuration account
    /// 2. `[writable]` passenger: [Passenger]
    /// 3. `[signer]` user: [AccountInfo] User's wallet address
    /// 4. `[writable]` user_token_account: [AccountInfo] User's token account for refund
    /// 5. `[writable]` system_token_account: [AccountInfo] System's token account for refund
    /// 6. `[]` currency_mint: [Mint] Currency mint address
    /// 7. `[writable]` source: [AccountInfo] The source account.
    /// 8. `[]` mint: [Mint] The token mint.
    /// 9. `[writable]` destination: [AccountInfo] The destination account.
    /// 10. `[signer]` authority: [AccountInfo] The source account's owner/delegate.
    /// 11. `[]` token_program: [AccountInfo] Auto-generated, TokenProgram
    ///
    /// Data: None
    pub fn cancel_subscription(ctx: Context<CancelSubscription>) -> Result<()> {
        cancel_subscription::handler(ctx)
    }
}