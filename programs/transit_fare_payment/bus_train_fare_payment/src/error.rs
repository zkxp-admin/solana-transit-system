use anchor_lang::prelude::*;

#[error_code]
pub enum BusTrainError {
    #[msg("Invalid transport mode. Must be 0 (bus) or 1 (train).")]
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
}