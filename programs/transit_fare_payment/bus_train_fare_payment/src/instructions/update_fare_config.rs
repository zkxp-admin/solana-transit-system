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

/// Update fare configuration settings
///
/// Accounts:
/// 0. `[writable, signer]` fee_payer: [AccountInfo] 
/// 1. `[writable]` fare_config: [FareConfig] 
/// 2. `[signer]` admin: [AccountInfo] Administrator account
///
/// Data:
/// - bus_fare: [Option<u64>] New bus fare amount (optional)
/// - train_fare: [Option<u64>] New train fare amount (optional)
pub fn handler(
    ctx: Context<UpdateFareConfig>,
    bus_fare: Option<u64>,
    train_fare: Option<u64>,
) -> Result<()> {
    if let Some(fare) = bus_fare {
        ctx.accounts.fare_config.bus_fare = fare;
    }
    
    if let Some(fare) = train_fare {
        ctx.accounts.fare_config.train_fare = fare;
    }

    Ok(())
}