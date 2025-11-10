
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
