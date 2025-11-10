use anchor_lang::prelude::*;

#[account]
pub struct Ticket {
	pub user: Pubkey,
	pub ticket_id: u64,
	pub transport_mode: u8,     // 0 = bus, 1 = train
	pub fare_amount: u64,
	pub purchase_timestamp: i64,
	pub status: u8,             // 0 = unused, 1 = used
	pub bump: u8,
}