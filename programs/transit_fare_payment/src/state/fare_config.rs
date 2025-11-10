use anchor_lang::prelude::*;

#[account]
pub struct FareConfig {
	pub admin: Pubkey,
	pub mode_0_fare: u64,
	pub mode_1_fare: u64,
	pub currency_mint: Pubkey,
	pub total_tickets_sold: u64,
	// Subscription pricing
	pub monthly_pass_price: u64,       // Price for 30-day subscription
	pub yearly_pass_price: u64,        // Price for 365-day subscription
	pub total_active_subscriptions: u64, // Count of active subscriptions
	pub bump: u8,
}