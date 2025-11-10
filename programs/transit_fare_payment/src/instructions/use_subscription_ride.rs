use crate::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct UseSubscriptionRide<'info> {
    #[account(mut)]
    pub fee_payer: Signer<'info>,

    #[account(
        mut,
        seeds = [
            b"passenger",
            user.key().as_ref(),
        ],
        bump = passenger.bump,
    )]
    pub passenger: Account<'info, Passenger>,

    pub user: Signer<'info>,
}

/// Use a subscription ride for transit travel
///
/// Accounts:
/// 0. `[writable, signer]` fee_payer: [AccountInfo]
/// 1. `[writable]` passenger: [Passenger]
/// 2. `[signer]` user: [AccountInfo] User's wallet address
///
/// Data: None
pub fn handler(
    ctx: Context<UseSubscriptionRide>,
) -> Result<()> {
    // Verify that the passenger has an active subscription
    let current_time = Clock::get()?.unix_timestamp;
    require!(
        ctx.accounts.passenger.subscription_type > 0,
        FarePaymentError::SubscriptionNotFound
    );

    // Verify that the subscription has not expired
    require!(
        current_time < ctx.accounts.passenger.subscription_end,
        FarePaymentError::SubscriptionExpired
    );

    // Increment the rides used counter
    ctx.accounts.passenger.subscription_rides_used += 1;

    Ok(())
}
