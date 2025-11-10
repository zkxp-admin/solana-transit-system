use crate::*;
use anchor_lang::prelude::*;

use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};

#[derive(Accounts)]
#[instruction(
    subscription_type: u8,
)]
pub struct PurchaseSubscription<'info> {
    #[account(mut)]
    pub fee_payer: Signer<'info>,

    #[account(
        seeds = [
            b"fare_config",
        ],
        bump = fare_config.bump,
    )]
    pub fare_config: Account<'info, FareConfig>,

    #[account(
        init_if_needed,
        space = 109,
        payer = fee_payer,
        seeds = [
            b"passenger",
            user.key().as_ref(),
        ],
        bump,
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

    pub system_program: Program<'info, System>,

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

impl<'info> PurchaseSubscription<'info> {
    pub fn cpi_token_transfer_checked(&self, amount: u64, decimals: u8) -> Result<()> {
        anchor_spl::token::transfer_checked(
            CpiContext::new(self.token_program.to_account_info(),
                anchor_spl::token::TransferChecked {
                    from: self.source.to_account_info(),
                    mint: self.mint.to_account_info(),
                    to: self.destination.to_account_info(),
                    authority: self.authority.to_account_info()
                }
            ),
            amount,
            decimals,
        )
    }
}

/// Purchase a subscription pass for transit travel
///
/// Accounts:
/// 0. `[writable, signer]` fee_payer: [AccountInfo]
/// 1. `[]` fare_config: [FareConfig] Fare configuration account
/// 2. `[writable]` passenger: [Passenger]
/// 3. `[signer]` user: [AccountInfo] User's wallet address
/// 4. `[writable]` user_token_account: [AccountInfo] User's token account for payment
/// 5. `[writable]` system_token_account: [AccountInfo] System's token account for receiving payment
/// 6. `[]` currency_mint: [Mint] Currency mint address
/// 7. `[]` system_program: [AccountInfo] Auto-generated, for account initialization
/// 8. `[writable]` source: [AccountInfo] The source account.
/// 9. `[]` mint: [Mint] The token mint.
/// 10. `[writable]` destination: [AccountInfo] The destination account.
/// 11. `[signer]` authority: [AccountInfo] The source account's owner/delegate.
/// 12. `[]` token_program: [AccountInfo] Auto-generated, TokenProgram
///
/// Data:
/// - subscription_type: [u8] Subscription type (1=monthly, 2=yearly)
pub fn handler(
    ctx: Context<PurchaseSubscription>,
    subscription_type: u8,
) -> Result<()> {
    // Validate subscription type
    require!(subscription_type == 1 || subscription_type == 2, FarePaymentError::InvalidSubscriptionType);

    // Check if user already has active subscription
    let current_time = Clock::get()?.unix_timestamp;
    if ctx.accounts.passenger.subscription_type > 0 && ctx.accounts.passenger.subscription_end > current_time {
        return Err(FarePaymentError::SubscriptionAlreadyActive.into());
    }

    // Determine price and duration
    let (price, duration_seconds) = if subscription_type == 1 {
        // Monthly: 30 days
        (ctx.accounts.fare_config.monthly_pass_price, 30 * 24 * 60 * 60)
    } else {
        // Yearly: 365 days
        (ctx.accounts.fare_config.yearly_pass_price, 365 * 24 * 60 * 60)
    };

    // Transfer tokens from user to system
    ctx.accounts.cpi_token_transfer_checked(price, 9)?;

    // Initialize passenger if needed
    if ctx.accounts.passenger.ticket_count == 0 && ctx.accounts.passenger.subscription_type == 0 {
        ctx.accounts.passenger.user = ctx.accounts.user.key();
        ctx.accounts.passenger.total_spent = 0;
        ctx.accounts.passenger.ticket_count = 0;
        ctx.accounts.passenger.last_ticket_timestamp = 0;
        ctx.accounts.passenger.subscription_type = 0;
        ctx.accounts.passenger.subscription_start = 0;
        ctx.accounts.passenger.subscription_end = 0;
        ctx.accounts.passenger.subscription_rides_used = 0;
    }

    // Update passenger subscription data
    ctx.accounts.passenger.subscription_type = subscription_type;
    ctx.accounts.passenger.subscription_start = current_time;
    ctx.accounts.passenger.subscription_end = current_time + duration_seconds;
    ctx.accounts.passenger.subscription_rides_used = 0;
    ctx.accounts.passenger.total_spent += price;

    // Update fare config
    ctx.accounts.fare_config.total_active_subscriptions += 1;

    Ok(())
}
