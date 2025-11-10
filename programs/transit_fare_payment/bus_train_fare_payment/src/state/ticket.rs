
use anchor_lang::prelude::*;

#[account]
pub struct Ticket {
	pub user: Pubkey,
	pub ticket_id: u64,
	pub transport_mode: u8,
	pub fare_amount: u64,
	pub purchase_timestamp: i64,
	pub status: u8,
	pub bump: u8,
}
