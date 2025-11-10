use crate::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct RefundTicket<'info> {
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
        mut,
        seeds = [
            b"passenger",
            user.key().as_ref(),
        ],
        bump = passenger.bump,
    )]
    pub passenger: Account<'info, Passenger>,

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

/// Refund a ticket and return funds to user
///
/// Accounts:
/// 0. `[writable, signer]` fee_payer: [AccountInfo] 
/// 1. `[]` fare_config: [FareConfig] Fare configuration account
/// 2. `[writable]` passenger: [Passenger] 
/// 3. `[writable]` ticket: [Ticket] 
/// 4. `[signer]` user: [AccountInfo] User's wallet address
/// 5. `[writable]` user_token_account: [AccountInfo] User's token account for refund
/// 6. `[writable]` system_token_account: [AccountInfo] System's token account for refund
/// 7. `[]` currency_mint: [Mint] Currency mint address
/// 8. `[writable]` source: [AccountInfo] The source account.
/// 9. `[]` mint: [Mint] The token mint.
/// 10. `[writable]` destination: [AccountInfo] The destination account.
/// 11. `[signer]` authority: [AccountInfo] The source account's owner/delegate.
/// 12. `[]` token_program: [AccountInfo] Auto-generated, TokenProgram
///
/// Data:
/// - ticket_id: [u64] Ticket identifier
pub fn handler(
    ctx: Context<RefundTicket>,
    ticket_id: u64,
) -> Result<()> {
    // Verify that the ticket belongs to the user
    require!(ctx.accounts.ticket.user == ctx.accounts.user.key(), BusTrainError::Unauthorized);
    
    // Verify that the ticket hasn't been used already
    require!(ctx.accounts.ticket.status == 0, BusTrainError::TicketAlreadyUsed);
    
    // Transfer tokens from system to user
    let amount = ctx.accounts.ticket.fare_amount;
    anchor_spl::token::transfer_checked(
        CpiContext::new(ctx.accounts.token_program.to_account_info(), 
            anchor_spl::token::TransferChecked {
                from: ctx.accounts.source.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.destination.to_account_info(),
                authority: ctx.accounts.authority.to_account_info()
            }
        ),
        amount, 
        9, 
    )?;
    
    // Update fare config
    ctx.accounts.fare_config.total_tickets_sold = ctx.accounts.fare_config.total_tickets_sold.saturating_sub(1);
    
    // Update passenger stats
    ctx.accounts.passenger.total_spent = ctx.accounts.passenger.total_spent.saturating_sub(amount);
    ctx.accounts.passenger.ticket_count = ctx.accounts.passenger.ticket_count.saturating_sub(1);
    
    // Delete ticket account
    ctx.accounts.ticket.close(ctx.accounts.fee_payer.to_account_info())?;
    
    Ok(())
}