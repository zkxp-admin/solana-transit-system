use anchor_lang::prelude::*;

#[account]
pub struct FareConfig {
    pub admin: Pubkey,
    pub bus_fare: u64,
    pub train_fare: u64,
    pub currency_mint: Pubkey,
    pub total_tickets_sold: u64,
    pub bump: u8,
}

#[account]
pub struct Passenger {
    pub user: Pubkey,
    pub total_spent: u64,
    pub ticket_count: u32,
    pub last_ticket_timestamp: i64,
    pub bump: u8,
}

#[account]
pub struct Ticket {
    pub user: Pubkey,
    pub ticket_id: u64,
    pub transport_mode: u8,
    pub fare_amount: u64,
    pub purchase_timestamp: i64,
    pub status: u8, // 0 = unused, 1 = used
    pub bump: u8,
}

#[account]
pub struct Payment {
    pub user: Pubkey,
    pub payment_id: u64,
    pub amount: u64,
    pub currency_mint: Pubkey,
    pub payment_timestamp: i64,
    pub transaction_hash: String,
    pub bump: u8,
}