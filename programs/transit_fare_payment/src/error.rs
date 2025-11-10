use anchor_lang::prelude::*;

#[error_code]
pub enum FarePaymentError {
    #[msg("Invalid transport mode.")]
    InvalidTransportMode,
    #[msg("Invalid payment amount.")]
    InvalidAmount,
    #[msg("Unauthorized access.")]
    Unauthorized,
    #[msg("Ticket has already been used.")]
    TicketAlreadyUsed,
    #[msg("Insufficient funds.")]
    InsufficientFunds,
    #[msg("Invalid account data.")]
    InvalidAccountData,
    #[msg("Invalid subscription type. Must be 1 (monthly) or 2 (yearly).")]
    InvalidSubscriptionType,
    #[msg("User already has an active subscription.")]
    SubscriptionAlreadyActive,
    #[msg("Subscription has expired.")]
    SubscriptionExpired,
    #[msg("No active subscription found.")]
    SubscriptionNotFound,
}