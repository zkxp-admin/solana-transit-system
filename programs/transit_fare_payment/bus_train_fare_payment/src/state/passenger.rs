
use anchor_lang::prelude::*;

#[account]
pub struct Passenger {
	pub user: Pubkey,
	pub total_spent: u64,
	pub ticket_count: u32,
	pub last_ticket_timestamp: i64,
	pub bump: u8,
}
