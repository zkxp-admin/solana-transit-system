use crate::*;
use anchor_lang::prelude::*;
use std::str::FromStr;

use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};

#[derive(Accounts)]
#[instruction(
    transport_mode: u8,
    ticket_id: u64,
    amount: u64,
)]
pub struct PurchaseTicket<'info> {
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
        space=61,
        payer=fee_payer,
        seeds = [
            b"passenger",
            user.key().as_ref(),
        ],
        bump,
    )]
    pub passenger: Account<'info, Passenger>,

    #[account(
        init,
        space=67,
        payer=fee_payer,
        seeds = [
            b"ticket",
            user.key().as_ref(),
            ticket_id.to_le_bytes().as_ref(),
        ],
        bump,
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

impl<'info> PurchaseTicket<'info> {
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

/// Purchase a transit ticket for any transport mode
///
/// Accounts:
/// 0. `[writable, signer]` fee_payer: [AccountInfo]
/// 1. `[]` fare_config: [FareConfig] Fare configuration account
/// 2. `[writable]` passenger: [Passenger]
/// 3. `[writable]` ticket: [Ticket]
/// 4. `[signer]` user: [AccountInfo] User's wallet address
/// 5. `[writable]` user_token_account: [AccountInfo] User's token account for payment
/// 6. `[writable]` system_token_account: [AccountInfo] System's token account for receiving payment
/// 7. `[]` currency_mint: [Mint] Currency mint address
/// 8. `[]` system_program: [AccountInfo] Auto-generated, for account initialization
/// 9. `[writable]` source: [AccountInfo] The source account.
/// 10. `[]` mint: [Mint] The token mint.
/// 11. `[writable]` destination: [AccountInfo] The destination account.
/// 12. `[signer]` authority: [AccountInfo] The source account's owner/delegate.
/// 13. `[]` token_program: [AccountInfo] Auto-generated, TokenProgram
///
/// Data:
/// - transport_mode: [u8] Transport mode (0 = bus, 1 = train)
/// - ticket_id: [u64] Unique ticket identifier
/// - amount: [u64] Amount to pay for the ticket
pub fn handler(
    ctx: Context<PurchaseTicket>,
    transport_mode: u8,
    ticket_id: u64,
    amount: u64,
) -> Result<()> {
    // Validate transport mode (0 = bus, 1 = train)
    require!(transport_mode == crate::TRANSPORT_MODE_BUS || transport_mode == crate::TRANSPORT_MODE_TRAIN, FarePaymentError::InvalidTransportMode);

    // Get the appropriate fare based on transport mode
    let fare = if transport_mode == crate::TRANSPORT_MODE_BUS {
        ctx.accounts.fare_config.bus_fare
    } else {
        ctx.accounts.fare_config.train_fare
    };

    require!(amount == fare, FarePaymentError::InvalidAmount);
    
    // Transfer tokens from user to system
    ctx.accounts.cpi_token_transfer_checked(amount, 9)?;
    
    // Update fare config
    ctx.accounts.fare_config.total_tickets_sold += 1;
    
    // Initialize passenger if needed
    if ctx.accounts.passenger.ticket_count == 0 {
        ctx.accounts.passenger.user = ctx.accounts.user.key();
        ctx.accounts.passenger.total_spent = 0;
        ctx.accounts.passenger.ticket_count = 0;
        ctx.accounts.passenger.last_ticket_timestamp = 0;
    }
    
    // Update passenger stats
    ctx.accounts.passenger.total_spent += amount;
    ctx.accounts.passenger.ticket_count += 1;
    ctx.accounts.passenger.last_ticket_timestamp = Clock::get()?.unix_timestamp;
    
    // Initialize ticket
    ctx.accounts.ticket.user = ctx.accounts.user.key();
    ctx.accounts.ticket.ticket_id = ticket_id;
    ctx.accounts.ticket.transport_mode = transport_mode;
    ctx.accounts.ticket.fare_amount = amount;
    ctx.accounts.ticket.purchase_timestamp = Clock::get()?.unix_timestamp;
    ctx.accounts.ticket.status = 0; // Unused
    ctx.accounts.ticket.bump = ctx.bumps.ticket;
    
    Ok(())
}