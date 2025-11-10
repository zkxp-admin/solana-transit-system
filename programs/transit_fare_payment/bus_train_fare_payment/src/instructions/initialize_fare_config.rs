use crate::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct InitializeFareConfig<'info> {
    #[account(mut)]
    pub fee_payer: Signer<'info>,

    #[account(
        init,
        space = 97,
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

/// Initialize the fare configuration with default values
///
/// Accounts:
/// 0. `[writable, signer]` fee_payer: [AccountInfo] 
/// 1. `[writable]` fare_config: [FareConfig] 
/// 2. `[signer]` admin: [AccountInfo] Administrator account
/// 3. `[]` system_program: [AccountInfo] Auto-generated, for account initialization
///
/// Data:
/// - bus_fare: [u64] Default bus fare amount
/// - train_fare: [u64] Default train fare amount
/// - currency_mint: [Pubkey] Currency mint address
pub fn handler(
    ctx: Context<InitializeFareConfig>,
    bus_fare: u64,
    train_fare: u64,
    currency_mint: Pubkey,
) -> Result<()> {
    ctx.accounts.fare_config.set_inner(FareConfig {
        admin: ctx.accounts.admin.key(),
        bus_fare,
        train_fare,
        currency_mint,
        total_tickets_sold: 0,
        bump: ctx.bumps.fare_config,
    });

    Ok(())
}