use crate::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct RecordPayment<'info> {
    #[account(mut)]
    pub fee_payer: Signer<'info>,

    #[account(
        init,
        space = 100,
        payer = fee_payer,
        seeds = [
            b"payment",
            user.key().as_ref(),
            payment_id.to_le_bytes().as_ref(),
        ],
        bump,
    )]
    pub payment: Account<'info, Payment>,

    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

/// Record a payment transaction
///
/// Accounts:
/// 0. `[writable, signer]` fee_payer: [AccountInfo] 
/// 1. `[writable]` payment: [Payment] 
/// 2. `[signer]` user: [AccountInfo] User's wallet address
/// 3. `[]` system_program: [AccountInfo] Auto-generated, for account initialization
///
/// Data:
/// - payment_id: [u64] Unique payment identifier
/// - amount: [u64] Payment amount
/// - currency_mint: [Pubkey] Currency mint address
/// - transaction_hash: [String] Transaction hash for reference
pub fn handler(
    ctx: Context<RecordPayment>,
    payment_id: u64,
    amount: u64,
    currency_mint: Pubkey,
    transaction_hash: String,
) -> Result<()> {
    ctx.accounts.payment.user = ctx.accounts.user.key();
    ctx.accounts.payment.payment_id = payment_id;
    ctx.accounts.payment.amount = amount;
    ctx.accounts.payment.currency_mint = currency_mint;
    ctx.accounts.payment.payment_timestamp = Clock::get()?.unix_timestamp;
    ctx.accounts.payment.transaction_hash = transaction_hash;
    ctx.accounts.payment.bump = ctx.bumps.payment;
    
    Ok(())
}