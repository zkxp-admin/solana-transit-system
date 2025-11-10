use crate::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct UpdateFareConfig<'info> {
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

    pub admin: Signer<'info>,
}

/// Update transit fare configuration settings
///
/// Accounts:
/// 0. `[writable, signer]` fee_payer: [AccountInfo]
/// 1. `[writable]` fare_config: [FareConfig]
/// 2. `[signer]` admin: [AccountInfo] Administrator account
///
/// Data:
/// - mode_0_fare: [Option<u64>] New transport mode 0 fare amount (optional)
/// - mode_1_fare: [Option<u64>] New transport mode 1 fare amount (optional)
/// - monthly_pass_price: [Option<u64>] New monthly subscription price (optional)
/// - yearly_pass_price: [Option<u64>] New yearly subscription price (optional)
pub fn handler(
    ctx: Context<UpdateFareConfig>,
    mode_0_fare: Option<u64>,
    mode_1_fare: Option<u64>,
    monthly_pass_price: Option<u64>,
    yearly_pass_price: Option<u64>,
) -> Result<()> {
    if let Some(fare) = mode_0_fare {
        ctx.accounts.fare_config.mode_0_fare = fare;
    }

    if let Some(fare) = mode_1_fare {
        ctx.accounts.fare_config.mode_1_fare = fare;
    }

    if let Some(price) = monthly_pass_price {
        ctx.accounts.fare_config.monthly_pass_price = price;
    }

    if let Some(price) = yearly_pass_price {
        ctx.accounts.fare_config.yearly_pass_price = price;
    }

    Ok(())
}