use anchor_lang::prelude::*;

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