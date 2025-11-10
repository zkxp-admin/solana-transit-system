use anchor_lang::prelude::*;

#[account]
pub struct FareConfig {
	pub admin: Pubkey,
	pub bus_fare: u64,        // Transport mode 0: bus fare amount
	pub train_fare: u64,      // Transport mode 1: train fare amount
	pub currency_mint: Pubkey,
	pub total_tickets_sold: u64,
	// Subscription pricing
	pub monthly_pass_price: u64,       // Price for 30-day subscription
	pub yearly_pass_price: u64,        // Price for 365-day subscription
	pub total_active_subscriptions: u64, // Count of active subscriptions
	pub bump: u8,
}