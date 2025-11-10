use anchor_lang::prelude::*;

#[account]
pub struct Passenger {
	pub user: Pubkey,
	pub total_spent: u64,
	pub ticket_count: u32,
	pub last_ticket_timestamp: i64,
	// Subscription fields
	pub subscription_type: u8,          // 0=none, 1=monthly, 2=yearly
	pub subscription_start: i64,        // Subscription start timestamp
	pub subscription_end: i64,          // Subscription expiry timestamp
	pub subscription_rides_used: u32,   // Rides used in current subscription period
	pub bump: u8,
}