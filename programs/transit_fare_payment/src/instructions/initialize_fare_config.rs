use crate::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct InitializeFareConfig<'info> {
    #[account(mut)]
    pub fee_payer: Signer<'info>,

    #[account(
        init,
        space = 145,
        payer = fee_payer,
        seeds = [
            b"fare_config",
        ],
        bump,
    )]
    pub fare_config: Account<'info, FareConfig>,

    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

/// Initialize the transit fare configuration with default values
///
/// Accounts:
/// 0. `[writable, signer]` fee_payer: [AccountInfo]
/// 1. `[writable]` fare_config: [FareConfig]
/// 2. `[signer]` admin: [AccountInfo] Administrator account
/// 3. `[]` system_program: [AccountInfo] Auto-generated, for account initialization
///
/// Data:
/// - mode_0_fare: [u64] Default bus fare amount (transport mode 0 = bus)
/// - mode_1_fare: [u64] Default train fare amount (transport mode 1 = train)
/// - currency_mint: [Pubkey] Currency mint address
/// - monthly_pass_price: [u64] Price for 30-day subscription
/// - yearly_pass_price: [u64] Price for 365-day subscription
pub fn handler(
    ctx: Context<InitializeFareConfig>,
    mode_0_fare: u64,
    mode_1_fare: u64,
    currency_mint: Pubkey,
    monthly_pass_price: u64,
    yearly_pass_price: u64,
) -> Result<()> {
    ctx.accounts.fare_config.set_inner(FareConfig {
        admin: ctx.accounts.admin.key(),
        bus_fare: mode_0_fare,      // Transport mode 0: bus
        train_fare: mode_1_fare,    // Transport mode 1: train
        currency_mint,
        total_tickets_sold: 0,
        monthly_pass_price,
        yearly_pass_price,
        total_active_subscriptions: 0,
        bump: ctx.bumps.fare_config,
    });

    Ok(())
}