use crate::*;
use anchor_lang::prelude::*;

use anchor_spl::{
    token::{Mint, Token},
};

#[derive(Accounts)]
pub struct CancelSubscription<'info> {
    #[account(mut)]
    pub fee_payer: Signer<'info>,

    #[account(
        mut,
        seeds = [
            b"fare_config",
        ],
        bump = fare_config.bump,
    )]
    pub fare_config: Account<'info, FareConfig>,

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

    #[account(
        mut,
    )]
    /// CHECK: implement manual checks if needed
    pub user_token_account: UncheckedAccount<'info>,

    #[account(
        mut,
    )]
    /// CHECK: implement manual checks if needed
    pub system_token_account: UncheckedAccount<'info>,

    pub currency_mint: Account<'info, Mint>,

    #[account(
        mut,
    )]
    /// CHECK: implement manual checks if needed
    pub source: UncheckedAccount<'info>,

    pub mint: Account<'info, Mint>,

    #[account(
        mut,
    )]
    /// CHECK: implement manual checks if needed
    pub destination: UncheckedAccount<'info>,

    pub authority: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

/// Cancel an active subscription and process pro-rated refund
///
/// Accounts:
/// 0. `[writable, signer]` fee_payer: [AccountInfo]
/// 1. `[writable]` fare_config: [FareConfig] Fare configuration account
/// 2. `[writable]` passenger: [Passenger]
/// 3. `[signer]` user: [AccountInfo] User's wallet address
/// 4. `[writable]` user_token_account: [AccountInfo] User's token account for refund
/// 5. `[writable]` system_token_account: [AccountInfo] System's token account for refund
/// 6. `[]` currency_mint: [Mint] Currency mint address
/// 7. `[writable]` source: [AccountInfo] The source account.
/// 8. `[]` mint: [Mint] The token mint.
/// 9. `[writable]` destination: [AccountInfo] The destination account.
/// 10. `[signer]` authority: [AccountInfo] The source account's owner/delegate.
/// 11. `[]` token_program: [AccountInfo] Auto-generated, TokenProgram
///
/// Data: None
pub fn handler(
    ctx: Context<CancelSubscription>,
) -> Result<()> {
    // Verify that the passenger has an active subscription
    require!(
        ctx.accounts.passenger.subscription_type > 0,
        FarePaymentError::SubscriptionNotFound
    );

    let current_time = Clock::get()?.unix_timestamp;

    // Calculate the pro-rated refund
    let subscription_start = ctx.accounts.passenger.subscription_start;
    let subscription_end = ctx.accounts.passenger.subscription_end;
    let subscription_type = ctx.accounts.passenger.subscription_type;

    let total_duration = subscription_end - subscription_start;
    let remaining_duration = if current_time < subscription_end {
        subscription_end - current_time
    } else {
        0
    };

    // Determine original price based on subscription type
    let original_price = if subscription_type == 1 {
        ctx.accounts.fare_config.monthly_pass_price
    } else {
        ctx.accounts.fare_config.yearly_pass_price
    };

    // Calculate pro-rated refund: (remaining_time / total_time) * original_price
    let refund_amount = if total_duration > 0 {
        (remaining_duration as u128 * original_price as u128 / total_duration as u128) as u64
    } else {
        0
    };

    // Transfer refund back to user if there's an amount to refund
    if refund_amount > 0 {
        anchor_spl::token::transfer_checked(
            CpiContext::new(ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::TransferChecked {
                    from: ctx.accounts.source.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.destination.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info()
                }
            ),
            refund_amount,
            9,
        )?;
    }

    // Reset subscription fields
    ctx.accounts.passenger.subscription_type = 0;
    ctx.accounts.passenger.subscription_start = 0;
    ctx.accounts.passenger.subscription_end = 0;
    ctx.accounts.passenger.subscription_rides_used = 0;

    // Decrement active subscriptions counter
    ctx.accounts.fare_config.total_active_subscriptions = ctx.accounts.fare_config.total_active_subscriptions.saturating_sub(1);

    Ok(())
}
