use crate::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct UseTicket<'info> {
    #[account(mut)]
    pub fee_payer: Signer<'info>,

    #[account(
        mut,
        seeds = [
            b"ticket",
            user.key().as_ref(),
            ticket_id.to_le_bytes().as_ref(),
        ],
        bump = ticket.bump,
    )]
    pub ticket: Account<'info, Ticket>,

    pub user: Signer<'info>,
}

/// Mark a ticket as used for travel
///
/// Accounts:
/// 0. `[writable, signer]` fee_payer: [AccountInfo] 
/// 1. `[writable]` ticket: [Ticket] 
/// 2. `[signer]` user: [AccountInfo] User's wallet address
///
/// Data:
/// - ticket_id: [u64] Ticket identifier
pub fn handler(ctx: Context<UseTicket>, ticket_id: u64) -> Result<()> {
    // Verify that the ticket belongs to the user
    require!(ctx.accounts.ticket.user == ctx.accounts.user.key(), BusTrainError::Unauthorized);
    
    // Verify that the ticket hasn't been used already
    require!(ctx.accounts.ticket.status == 0, BusTrainError::TicketAlreadyUsed);
    
    // Mark ticket as used
    ctx.accounts.ticket.status = 1; // Used
    
    Ok(())
}