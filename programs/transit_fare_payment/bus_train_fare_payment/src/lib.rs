use anchor_lang::prelude::*;
use std::str::FromStr;

declare_id!("FQB354YeYLHky7omGhQXQxQ2QBcuYLq2QXiF4gdVogJt");

#[program]
pub mod bus_train_fare_payment {
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
    /// - bus_fare: [u64] Default bus fare amount
    /// - train_fare: [u64] Default train fare amount
    /// - currency_mint: [Pubkey] Currency mint address
    pub fn initialize_fare_config(ctx: Context<InitializeFareConfig>, bus_fare: u64, train_fare: u64, currency_mint: Pubkey) -> Result<()> {
        initialize_fare_config::handler(ctx, bus_fare, train_fare, currency_mint)
    }

    /// Update fare configuration settings
    ///
    /// Accounts:
    /// 0. `[writable, signer]` fee_payer: [AccountInfo] 
    /// 1. `[writable]` fare_config: [FareConfig] 
    /// 2. `[signer]` admin: [AccountInfo] Administrator account
    ///
    /// Data:
    /// - bus_fare: [Option<u64>] New bus fare amount (optional)
    /// - train_fare: [Option<u64>] New train fare amount (optional)
    pub fn update_fare_config(ctx: Context<UpdateFareConfig>, bus_fare: Option<u64>, train_fare: Option<u64>) -> Result<()> {
        update_fare_config::handler(ctx, bus_fare, train_fare)
    }

    /// Purchase a ticket for either bus or train travel
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
    /// - transport_mode: [u8] Transport mode (0 = bus, 1 = train)
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
}