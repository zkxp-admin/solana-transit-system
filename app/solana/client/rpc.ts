import BN from "bn.js";
import {
  AnchorProvider,
  type IdlAccounts,
  Program,
  web3,
} from "@coral-xyz/anchor";
import { MethodsBuilder } from "@coral-xyz/anchor/dist/cjs/program/namespace/methods";
import type { TransitFarePayment } from "../../../target/types/transit_fare_payment";
import idl from "../../../target/idl/transit_fare_payment.json";
import * as pda from "./pda";



let _program: Program<TransitFarePayment>;


export const initializeClient = (
    programId: web3.PublicKey,
    anchorProvider = AnchorProvider.env(),
) => {
    _program = new Program<TransitFarePayment>(
        idl as TransitFarePayment,
        anchorProvider,
    );


};

export type InitializeFareConfigArgs = {
  feePayer: web3.PublicKey;
  admin: web3.PublicKey;
  mode0Fare: bigint;
  mode1Fare: bigint;
  currencyMint: web3.PublicKey;
};

/**
 * ### Returns a {@link MethodsBuilder}
 * Initialize the transit fare configuration with default values
 *
 * Accounts:
 * 0. `[writable, signer]` fee_payer: {@link PublicKey}
 * 1. `[writable]` fare_config: {@link FareConfig}
 * 2. `[signer]` admin: {@link PublicKey} Administrator account
 * 3. `[]` system_program: {@link PublicKey} Auto-generated, for account initialization
 *
 * Data:
 * - mode_0_fare: {@link BigInt} Default bus fare amount (transport mode 0 = bus)
 * - mode_1_fare: {@link BigInt} Default train fare amount (transport mode 1 = train)
 * - currency_mint: {@link PublicKey} Currency mint address
 */
export const initializeFareConfigBuilder = (
	args: InitializeFareConfigArgs,
	remainingAccounts: Array<web3.AccountMeta> = [],
): MethodsBuilder<TransitFarePayment, never> => {
  const [fareConfigPubkey] = pda.deriveFareConfigPDA(_program.programId);

  return _program
    .methods
    .initializeFareConfig(
      new BN(args.mode0Fare.toString()),
      new BN(args.mode1Fare.toString()),
      args.currencyMint,
    )
    .accountsStrict({
      feePayer: args.feePayer,
      fareConfig: fareConfigPubkey,
      admin: args.admin,
      systemProgram: new web3.PublicKey("11111111111111111111111111111111"),
    })
    .remainingAccounts(remainingAccounts);
};

/**
 * ### Returns a {@link web3.TransactionInstruction}
 * Initialize the fare configuration with default values
 *
 * Accounts:
 * 0. `[writable, signer]` fee_payer: {@link PublicKey} 
 * 1. `[writable]` fare_config: {@link FareConfig} 
 * 2. `[signer]` admin: {@link PublicKey} Administrator account
 * 3. `[]` system_program: {@link PublicKey} Auto-generated, for account initialization
 *
 * Data:
 * - bus_fare: {@link BigInt} Default bus fare amount
 * - train_fare: {@link BigInt} Default train fare amount
 * - currency_mint: {@link PublicKey} Currency mint address
 */
export const initializeFareConfig = (
	args: InitializeFareConfigArgs,
	remainingAccounts: Array<web3.AccountMeta> = [],
): Promise<web3.TransactionInstruction> =>
    initializeFareConfigBuilder(args, remainingAccounts).instruction();

/**
 * ### Returns a {@link web3.TransactionSignature}
 * Initialize the fare configuration with default values
 *
 * Accounts:
 * 0. `[writable, signer]` fee_payer: {@link PublicKey} 
 * 1. `[writable]` fare_config: {@link FareConfig} 
 * 2. `[signer]` admin: {@link PublicKey} Administrator account
 * 3. `[]` system_program: {@link PublicKey} Auto-generated, for account initialization
 *
 * Data:
 * - bus_fare: {@link BigInt} Default bus fare amount
 * - train_fare: {@link BigInt} Default train fare amount
 * - currency_mint: {@link PublicKey} Currency mint address
 */
export const initializeFareConfigSendAndConfirm = async (
  args: Omit<InitializeFareConfigArgs, "feePayer" | "admin"> & {
    signers: {
      feePayer: web3.Signer,
      admin: web3.Signer,
    },
  },
  remainingAccounts: Array<web3.AccountMeta> = [],
): Promise<web3.TransactionSignature> => {
  const preInstructions: Array<web3.TransactionInstruction> = [];


  return initializeFareConfigBuilder({
      ...args,
      feePayer: args.signers.feePayer.publicKey,
      admin: args.signers.admin.publicKey,
    }, remainingAccounts)
    .preInstructions(preInstructions)
    .signers([args.signers.feePayer, args.signers.admin])
    .rpc();
}

export type UpdateFareConfigArgs = {
  feePayer: web3.PublicKey;
  admin: web3.PublicKey;
  mode0Fare: bigint | undefined;
  mode1Fare: bigint | undefined;
};

/**
 * ### Returns a {@link MethodsBuilder}
 * Update transit fare configuration settings
 *
 * Accounts:
 * 0. `[writable, signer]` fee_payer: {@link PublicKey}
 * 1. `[writable]` fare_config: {@link FareConfig}
 * 2. `[signer]` admin: {@link PublicKey} Administrator account
 *
 * Data:
 * - mode_0_fare: {@link BigInt | undefined} New bus fare amount (transport mode 0 = bus, optional)
 * - mode_1_fare: {@link BigInt | undefined} New train fare amount (transport mode 1 = train, optional)
 */
export const updateFareConfigBuilder = (
	args: UpdateFareConfigArgs,
	remainingAccounts: Array<web3.AccountMeta> = [],
): MethodsBuilder<TransitFarePayment, never> => {
  const [fareConfigPubkey] = pda.deriveFareConfigPDA(_program.programId);

  return _program
    .methods
    .updateFareConfig(
      args.mode0Fare ? new BN(args.mode0Fare.toString()) : undefined,
      args.mode1Fare ? new BN(args.mode1Fare.toString()) : undefined,
    )
    .accountsStrict({
      feePayer: args.feePayer,
      fareConfig: fareConfigPubkey,
      admin: args.admin,
    })
    .remainingAccounts(remainingAccounts);
};

/**
 * ### Returns a {@link web3.TransactionInstruction}
 * Update fare configuration settings
 *
 * Accounts:
 * 0. `[writable, signer]` fee_payer: {@link PublicKey} 
 * 1. `[writable]` fare_config: {@link FareConfig} 
 * 2. `[signer]` admin: {@link PublicKey} Administrator account
 *
 * Data:
 * - bus_fare: {@link BigInt | undefined} New bus fare amount (optional)
 * - train_fare: {@link BigInt | undefined} New train fare amount (optional)
 */
export const updateFareConfig = (
	args: UpdateFareConfigArgs,
	remainingAccounts: Array<web3.AccountMeta> = [],
): Promise<web3.TransactionInstruction> =>
    updateFareConfigBuilder(args, remainingAccounts).instruction();

/**
 * ### Returns a {@link web3.TransactionSignature}
 * Update fare configuration settings
 *
 * Accounts:
 * 0. `[writable, signer]` fee_payer: {@link PublicKey} 
 * 1. `[writable]` fare_config: {@link FareConfig} 
 * 2. `[signer]` admin: {@link PublicKey} Administrator account
 *
 * Data:
 * - bus_fare: {@link BigInt | undefined} New bus fare amount (optional)
 * - train_fare: {@link BigInt | undefined} New train fare amount (optional)
 */
export const updateFareConfigSendAndConfirm = async (
  args: Omit<UpdateFareConfigArgs, "feePayer" | "admin"> & {
    signers: {
      feePayer: web3.Signer,
      admin: web3.Signer,
    },
  },
  remainingAccounts: Array<web3.AccountMeta> = [],
): Promise<web3.TransactionSignature> => {
  const preInstructions: Array<web3.TransactionInstruction> = [];


  return updateFareConfigBuilder({
      ...args,
      feePayer: args.signers.feePayer.publicKey,
      admin: args.signers.admin.publicKey,
    }, remainingAccounts)
    .preInstructions(preInstructions)
    .signers([args.signers.feePayer, args.signers.admin])
    .rpc();
}

export type PurchaseTicketArgs = {
  feePayer: web3.PublicKey;
  user: web3.PublicKey;
  userTokenAccount: web3.PublicKey;
  systemTokenAccount: web3.PublicKey;
  currencyMint: web3.PublicKey;
  source: web3.PublicKey;
  mint: web3.PublicKey;
  destination: web3.PublicKey;
  authority: web3.PublicKey;
  transportMode: number;
  ticketId: bigint;
  amount: bigint;
};

/**
 * ### Returns a {@link MethodsBuilder}
 * Purchase a ticket for either bus or train travel
 *
 * Accounts:
 * 0. `[writable, signer]` fee_payer: {@link PublicKey} 
 * 1. `[]` fare_config: {@link FareConfig} Fare configuration account
 * 2. `[writable]` passenger: {@link Passenger} 
 * 3. `[writable]` ticket: {@link Ticket} 
 * 4. `[signer]` user: {@link PublicKey} User's wallet address
 * 5. `[writable]` user_token_account: {@link PublicKey} User's token account for payment
 * 6. `[writable]` system_token_account: {@link PublicKey} System's token account for receiving payment
 * 7. `[]` currency_mint: {@link Mint} Currency mint address
 * 8. `[]` system_program: {@link PublicKey} Auto-generated, for account initialization
 * 9. `[writable]` source: {@link PublicKey} The source account.
 * 10. `[]` mint: {@link Mint} The token mint.
 * 11. `[writable]` destination: {@link PublicKey} The destination account.
 * 12. `[signer]` authority: {@link PublicKey} The source account's owner/delegate.
 * 13. `[]` token_program: {@link PublicKey} Auto-generated, TokenProgram
 *
 * Data:
 * - transport_mode: {@link number} Transport mode (0 = bus, 1 = train)
 * - ticket_id: {@link BigInt} Unique ticket identifier
 * - amount: {@link BigInt} Amount to pay for the ticket
 */
export const purchaseTicketBuilder = (
	args: PurchaseTicketArgs,
	remainingAccounts: Array<web3.AccountMeta> = [],
): MethodsBuilder<TransitFarePayment, never> => {
  const [fareConfigPubkey] = pda.deriveFareConfigPDA(_program.programId);
    const [passengerPubkey] = pda.derivePassengerPDA({
        user: args.user,
    }, _program.programId);
    const [ticketPubkey] = pda.deriveTicketPDA({
        user: args.user,
        ticketId: args.ticketId,
    }, _program.programId);

  return _program
    .methods
    .purchaseTicket(
      args.transportMode,
      new BN(args.ticketId.toString()),
      new BN(args.amount.toString()),
    )
    .accountsStrict({
      feePayer: args.feePayer,
      fareConfig: fareConfigPubkey,
      passenger: passengerPubkey,
      ticket: ticketPubkey,
      user: args.user,
      userTokenAccount: args.userTokenAccount,
      systemTokenAccount: args.systemTokenAccount,
      currencyMint: args.currencyMint,
      systemProgram: new web3.PublicKey("11111111111111111111111111111111"),
      source: args.source,
      mint: args.mint,
      destination: args.destination,
      authority: args.authority,
      tokenProgram: new web3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
    })
    .remainingAccounts(remainingAccounts);
};

/**
 * ### Returns a {@link web3.TransactionInstruction}
 * Purchase a ticket for either bus or train travel
 *
 * Accounts:
 * 0. `[writable, signer]` fee_payer: {@link PublicKey} 
 * 1. `[]` fare_config: {@link FareConfig} Fare configuration account
 * 2. `[writable]` passenger: {@link Passenger} 
 * 3. `[writable]` ticket: {@link Ticket} 
 * 4. `[signer]` user: {@link PublicKey} User's wallet address
 * 5. `[writable]` user_token_account: {@link PublicKey} User's token account for payment
 * 6. `[writable]` system_token_account: {@link PublicKey} System's token account for receiving payment
 * 7. `[]` currency_mint: {@link Mint} Currency mint address
 * 8. `[]` system_program: {@link PublicKey} Auto-generated, for account initialization
 * 9. `[writable]` source: {@link PublicKey} The source account.
 * 10. `[]` mint: {@link Mint} The token mint.
 * 11. `[writable]` destination: {@link PublicKey} The destination account.
 * 12. `[signer]` authority: {@link PublicKey} The source account's owner/delegate.
 * 13. `[]` token_program: {@link PublicKey} Auto-generated, TokenProgram
 *
 * Data:
 * - transport_mode: {@link number} Transport mode (0 = bus, 1 = train)
 * - ticket_id: {@link BigInt} Unique ticket identifier
 * - amount: {@link BigInt} Amount to pay for the ticket
 */
export const purchaseTicket = (
	args: PurchaseTicketArgs,
	remainingAccounts: Array<web3.AccountMeta> = [],
): Promise<web3.TransactionInstruction> =>
    purchaseTicketBuilder(args, remainingAccounts).instruction();

/**
 * ### Returns a {@link web3.TransactionSignature}
 * Purchase a ticket for either bus or train travel
 *
 * Accounts:
 * 0. `[writable, signer]` fee_payer: {@link PublicKey} 
 * 1. `[]` fare_config: {@link FareConfig} Fare configuration account
 * 2. `[writable]` passenger: {@link Passenger} 
 * 3. `[writable]` ticket: {@link Ticket} 
 * 4. `[signer]` user: {@link PublicKey} User's wallet address
 * 5. `[writable]` user_token_account: {@link PublicKey} User's token account for payment
 * 6. `[writable]` system_token_account: {@link PublicKey} System's token account for receiving payment
 * 7. `[]` currency_mint: {@link Mint} Currency mint address
 * 8. `[]` system_program: {@link PublicKey} Auto-generated, for account initialization
 * 9. `[writable]` source: {@link PublicKey} The source account.
 * 10. `[]` mint: {@link Mint} The token mint.
 * 11. `[writable]` destination: {@link PublicKey} The destination account.
 * 12. `[signer]` authority: {@link PublicKey} The source account's owner/delegate.
 * 13. `[]` token_program: {@link PublicKey} Auto-generated, TokenProgram
 *
 * Data:
 * - transport_mode: {@link number} Transport mode (0 = bus, 1 = train)
 * - ticket_id: {@link BigInt} Unique ticket identifier
 * - amount: {@link BigInt} Amount to pay for the ticket
 */
export const purchaseTicketSendAndConfirm = async (
  args: Omit<PurchaseTicketArgs, "feePayer" | "user" | "authority"> & {
    signers: {
      feePayer: web3.Signer,
      user: web3.Signer,
      authority: web3.Signer,
    },
  },
  remainingAccounts: Array<web3.AccountMeta> = [],
): Promise<web3.TransactionSignature> => {
  const preInstructions: Array<web3.TransactionInstruction> = [];


  return purchaseTicketBuilder({
      ...args,
      feePayer: args.signers.feePayer.publicKey,
      user: args.signers.user.publicKey,
      authority: args.signers.authority.publicKey,
    }, remainingAccounts)
    .preInstructions(preInstructions)
    .signers([args.signers.feePayer, args.signers.user, args.signers.authority])
    .rpc();
}

export type UseTicketArgs = {
  feePayer: web3.PublicKey;
  user: web3.PublicKey;
  ticketId: bigint;
};

/**
 * ### Returns a {@link MethodsBuilder}
 * Mark a ticket as used for travel
 *
 * Accounts:
 * 0. `[writable, signer]` fee_payer: {@link PublicKey} 
 * 1. `[writable]` ticket: {@link Ticket} 
 * 2. `[signer]` user: {@link PublicKey} User's wallet address
 *
 * Data:
 * - ticket_id: {@link BigInt} Ticket identifier
 */
export const useTicketBuilder = (
	args: UseTicketArgs,
	remainingAccounts: Array<web3.AccountMeta> = [],
): MethodsBuilder<TransitFarePayment, never> => {
    const [ticketPubkey] = pda.deriveTicketPDA({
        user: args.user,
        ticketId: args.ticketId,
    }, _program.programId);

  return _program
    .methods
    .useTicket(
      new BN(args.ticketId.toString()),
    )
    .accountsStrict({
      feePayer: args.feePayer,
      ticket: ticketPubkey,
      user: args.user,
    })
    .remainingAccounts(remainingAccounts);
};

/**
 * ### Returns a {@link web3.TransactionInstruction}
 * Mark a ticket as used for travel
 *
 * Accounts:
 * 0. `[writable, signer]` fee_payer: {@link PublicKey} 
 * 1. `[writable]` ticket: {@link Ticket} 
 * 2. `[signer]` user: {@link PublicKey} User's wallet address
 *
 * Data:
 * - ticket_id: {@link BigInt} Ticket identifier
 */
export const useTicket = (
	args: UseTicketArgs,
	remainingAccounts: Array<web3.AccountMeta> = [],
): Promise<web3.TransactionInstruction> =>
    useTicketBuilder(args, remainingAccounts).instruction();

/**
 * ### Returns a {@link web3.TransactionSignature}
 * Mark a ticket as used for travel
 *
 * Accounts:
 * 0. `[writable, signer]` fee_payer: {@link PublicKey} 
 * 1. `[writable]` ticket: {@link Ticket} 
 * 2. `[signer]` user: {@link PublicKey} User's wallet address
 *
 * Data:
 * - ticket_id: {@link BigInt} Ticket identifier
 */
export const useTicketSendAndConfirm = async (
  args: Omit<UseTicketArgs, "feePayer" | "user"> & {
    signers: {
      feePayer: web3.Signer,
      user: web3.Signer,
    },
  },
  remainingAccounts: Array<web3.AccountMeta> = [],
): Promise<web3.TransactionSignature> => {
  const preInstructions: Array<web3.TransactionInstruction> = [];


  return useTicketBuilder({
      ...args,
      feePayer: args.signers.feePayer.publicKey,
      user: args.signers.user.publicKey,
    }, remainingAccounts)
    .preInstructions(preInstructions)
    .signers([args.signers.feePayer, args.signers.user])
    .rpc();
}

export type RefundTicketArgs = {
  feePayer: web3.PublicKey;
  user: web3.PublicKey;
  userTokenAccount: web3.PublicKey;
  systemTokenAccount: web3.PublicKey;
  currencyMint: web3.PublicKey;
  source: web3.PublicKey;
  mint: web3.PublicKey;
  destination: web3.PublicKey;
  authority: web3.PublicKey;
  ticketId: bigint;
};

/**
 * ### Returns a {@link MethodsBuilder}
 * Refund a ticket and return funds to user
 *
 * Accounts:
 * 0. `[writable, signer]` fee_payer: {@link PublicKey} 
 * 1. `[]` fare_config: {@link FareConfig} Fare configuration account
 * 2. `[writable]` passenger: {@link Passenger} 
 * 3. `[writable]` ticket: {@link Ticket} 
 * 4. `[signer]` user: {@link PublicKey} User's wallet address
 * 5. `[writable]` user_token_account: {@link PublicKey} User's token account for refund
 * 6. `[writable]` system_token_account: {@link PublicKey} System's token account for refund
 * 7. `[]` currency_mint: {@link Mint} Currency mint address
 * 8. `[writable]` source: {@link PublicKey} The source account.
 * 9. `[]` mint: {@link Mint} The token mint.
 * 10. `[writable]` destination: {@link PublicKey} The destination account.
 * 11. `[signer]` authority: {@link PublicKey} The source account's owner/delegate.
 * 12. `[]` token_program: {@link PublicKey} Auto-generated, TokenProgram
 *
 * Data:
 * - ticket_id: {@link BigInt} Ticket identifier
 */
export const refundTicketBuilder = (
	args: RefundTicketArgs,
	remainingAccounts: Array<web3.AccountMeta> = [],
): MethodsBuilder<TransitFarePayment, never> => {
  const [fareConfigPubkey] = pda.deriveFareConfigPDA(_program.programId);
    const [passengerPubkey] = pda.derivePassengerPDA({
        user: args.user,
    }, _program.programId);
    const [ticketPubkey] = pda.deriveTicketPDA({
        user: args.user,
        ticketId: args.ticketId,
    }, _program.programId);

  return _program
    .methods
    .refundTicket(
      new BN(args.ticketId.toString()),
    )
    .accountsStrict({
      feePayer: args.feePayer,
      fareConfig: fareConfigPubkey,
      passenger: passengerPubkey,
      ticket: ticketPubkey,
      user: args.user,
      userTokenAccount: args.userTokenAccount,
      systemTokenAccount: args.systemTokenAccount,
      currencyMint: args.currencyMint,
      source: args.source,
      mint: args.mint,
      destination: args.destination,
      authority: args.authority,
      tokenProgram: new web3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
    })
    .remainingAccounts(remainingAccounts);
};

/**
 * ### Returns a {@link web3.TransactionInstruction}
 * Refund a ticket and return funds to user
 *
 * Accounts:
 * 0. `[writable, signer]` fee_payer: {@link PublicKey} 
 * 1. `[]` fare_config: {@link FareConfig} Fare configuration account
 * 2. `[writable]` passenger: {@link Passenger} 
 * 3. `[writable]` ticket: {@link Ticket} 
 * 4. `[signer]` user: {@link PublicKey} User's wallet address
 * 5. `[writable]` user_token_account: {@link PublicKey} User's token account for refund
 * 6. `[writable]` system_token_account: {@link PublicKey} System's token account for refund
 * 7. `[]` currency_mint: {@link Mint} Currency mint address
 * 8. `[writable]` source: {@link PublicKey} The source account.
 * 9. `[]` mint: {@link Mint} The token mint.
 * 10. `[writable]` destination: {@link PublicKey} The destination account.
 * 11. `[signer]` authority: {@link PublicKey} The source account's owner/delegate.
 * 12. `[]` token_program: {@link PublicKey} Auto-generated, TokenProgram
 *
 * Data:
 * - ticket_id: {@link BigInt} Ticket identifier
 */
export const refundTicket = (
	args: RefundTicketArgs,
	remainingAccounts: Array<web3.AccountMeta> = [],
): Promise<web3.TransactionInstruction> =>
    refundTicketBuilder(args, remainingAccounts).instruction();

/**
 * ### Returns a {@link web3.TransactionSignature}
 * Refund a ticket and return funds to user
 *
 * Accounts:
 * 0. `[writable, signer]` fee_payer: {@link PublicKey} 
 * 1. `[]` fare_config: {@link FareConfig} Fare configuration account
 * 2. `[writable]` passenger: {@link Passenger} 
 * 3. `[writable]` ticket: {@link Ticket} 
 * 4. `[signer]` user: {@link PublicKey} User's wallet address
 * 5. `[writable]` user_token_account: {@link PublicKey} User's token account for refund
 * 6. `[writable]` system_token_account: {@link PublicKey} System's token account for refund
 * 7. `[]` currency_mint: {@link Mint} Currency mint address
 * 8. `[writable]` source: {@link PublicKey} The source account.
 * 9. `[]` mint: {@link Mint} The token mint.
 * 10. `[writable]` destination: {@link PublicKey} The destination account.
 * 11. `[signer]` authority: {@link PublicKey} The source account's owner/delegate.
 * 12. `[]` token_program: {@link PublicKey} Auto-generated, TokenProgram
 *
 * Data:
 * - ticket_id: {@link BigInt} Ticket identifier
 */
export const refundTicketSendAndConfirm = async (
  args: Omit<RefundTicketArgs, "feePayer" | "user" | "authority"> & {
    signers: {
      feePayer: web3.Signer,
      user: web3.Signer,
      authority: web3.Signer,
    },
  },
  remainingAccounts: Array<web3.AccountMeta> = [],
): Promise<web3.TransactionSignature> => {
  const preInstructions: Array<web3.TransactionInstruction> = [];


  return refundTicketBuilder({
      ...args,
      feePayer: args.signers.feePayer.publicKey,
      user: args.signers.user.publicKey,
      authority: args.signers.authority.publicKey,
    }, remainingAccounts)
    .preInstructions(preInstructions)
    .signers([args.signers.feePayer, args.signers.user, args.signers.authority])
    .rpc();
}

export type RecordPaymentArgs = {
  feePayer: web3.PublicKey;
  user: web3.PublicKey;
  paymentId: bigint;
  amount: bigint;
  currencyMint: web3.PublicKey;
  transactionHash: string;
};

/**
 * ### Returns a {@link MethodsBuilder}
 * Record a payment transaction
 *
 * Accounts:
 * 0. `[writable, signer]` fee_payer: {@link PublicKey} 
 * 1. `[writable]` payment: {@link Payment} 
 * 2. `[signer]` user: {@link PublicKey} User's wallet address
 * 3. `[]` system_program: {@link PublicKey} Auto-generated, for account initialization
 *
 * Data:
 * - payment_id: {@link BigInt} Unique payment identifier
 * - amount: {@link BigInt} Payment amount
 * - currency_mint: {@link PublicKey} Currency mint address
 * - transaction_hash: {@link string} Transaction hash for reference
 */
export const recordPaymentBuilder = (
	args: RecordPaymentArgs,
	remainingAccounts: Array<web3.AccountMeta> = [],
): MethodsBuilder<TransitFarePayment, never> => {
    const [paymentPubkey] = pda.derivePaymentPDA({
        user: args.user,
        paymentId: args.paymentId,
    }, _program.programId);

  return _program
    .methods
    .recordPayment(
      new BN(args.paymentId.toString()),
      new BN(args.amount.toString()),
      args.currencyMint,
      args.transactionHash,
    )
    .accountsStrict({
      feePayer: args.feePayer,
      payment: paymentPubkey,
      user: args.user,
      systemProgram: new web3.PublicKey("11111111111111111111111111111111"),
    })
    .remainingAccounts(remainingAccounts);
};

/**
 * ### Returns a {@link web3.TransactionInstruction}
 * Record a payment transaction
 *
 * Accounts:
 * 0. `[writable, signer]` fee_payer: {@link PublicKey} 
 * 1. `[writable]` payment: {@link Payment} 
 * 2. `[signer]` user: {@link PublicKey} User's wallet address
 * 3. `[]` system_program: {@link PublicKey} Auto-generated, for account initialization
 *
 * Data:
 * - payment_id: {@link BigInt} Unique payment identifier
 * - amount: {@link BigInt} Payment amount
 * - currency_mint: {@link PublicKey} Currency mint address
 * - transaction_hash: {@link string} Transaction hash for reference
 */
export const recordPayment = (
	args: RecordPaymentArgs,
	remainingAccounts: Array<web3.AccountMeta> = [],
): Promise<web3.TransactionInstruction> =>
    recordPaymentBuilder(args, remainingAccounts).instruction();

/**
 * ### Returns a {@link web3.TransactionSignature}
 * Record a payment transaction
 *
 * Accounts:
 * 0. `[writable, signer]` fee_payer: {@link PublicKey} 
 * 1. `[writable]` payment: {@link Payment} 
 * 2. `[signer]` user: {@link PublicKey} User's wallet address
 * 3. `[]` system_program: {@link PublicKey} Auto-generated, for account initialization
 *
 * Data:
 * - payment_id: {@link BigInt} Unique payment identifier
 * - amount: {@link BigInt} Payment amount
 * - currency_mint: {@link PublicKey} Currency mint address
 * - transaction_hash: {@link string} Transaction hash for reference
 */
export const recordPaymentSendAndConfirm = async (
  args: Omit<RecordPaymentArgs, "feePayer" | "user"> & {
    signers: {
      feePayer: web3.Signer,
      user: web3.Signer,
    },
  },
  remainingAccounts: Array<web3.AccountMeta> = [],
): Promise<web3.TransactionSignature> => {
  const preInstructions: Array<web3.TransactionInstruction> = [];


  return recordPaymentBuilder({
      ...args,
      feePayer: args.signers.feePayer.publicKey,
      user: args.signers.user.publicKey,
    }, remainingAccounts)
    .preInstructions(preInstructions)
    .signers([args.signers.feePayer, args.signers.user])
    .rpc();
}

export type PurchaseSubscriptionArgs = {
  feePayer: web3.PublicKey;
  user: web3.PublicKey;
  userTokenAccount: web3.PublicKey;
  systemTokenAccount: web3.PublicKey;
  currencyMint: web3.PublicKey;
  source: web3.PublicKey;
  mint: web3.PublicKey;
  destination: web3.PublicKey;
  authority: web3.PublicKey;
  subscriptionType: number;
};

/**
 * ### Returns a {@link MethodsBuilder}
 * Purchase a subscription pass (monthly or yearly)
 *
 * Accounts:
 * 0. `[writable, signer]` fee_payer: {@link PublicKey}
 * 1. `[]` fare_config: {@link FareConfig} Fare configuration account
 * 2. `[writable]` passenger: {@link Passenger}
 * 3. `[signer]` user: {@link PublicKey} User's wallet address
 * 4. `[writable]` user_token_account: {@link PublicKey} User's token account for payment
 * 5. `[writable]` system_token_account: {@link PublicKey} System's token account for receiving payment
 * 6. `[]` currency_mint: {@link Mint} Currency mint address
 * 7. `[]` system_program: {@link PublicKey} Auto-generated, for account initialization
 * 8. `[writable]` source: {@link PublicKey} The source account.
 * 9. `[]` mint: {@link Mint} The token mint.
 * 10. `[writable]` destination: {@link PublicKey} The destination account.
 * 11. `[signer]` authority: {@link PublicKey} The source account's owner/delegate.
 * 12. `[]` token_program: {@link PublicKey} Auto-generated, TokenProgram
 *
 * Data:
 * - subscription_type: {@link number} Subscription type (1 = monthly, 2 = yearly)
 */
export const purchaseSubscriptionBuilder = (
	args: PurchaseSubscriptionArgs,
	remainingAccounts: Array<web3.AccountMeta> = [],
): MethodsBuilder<TransitFarePayment, never> => {
  const [fareConfigPubkey] = pda.deriveFareConfigPDA(_program.programId);
  const [passengerPubkey] = pda.derivePassengerPDA({
      user: args.user,
  }, _program.programId);

  return _program
    .methods
    .purchaseSubscription(
      args.subscriptionType,
    )
    .accountsStrict({
      feePayer: args.feePayer,
      fareConfig: fareConfigPubkey,
      passenger: passengerPubkey,
      user: args.user,
      userTokenAccount: args.userTokenAccount,
      systemTokenAccount: args.systemTokenAccount,
      currencyMint: args.currencyMint,
      systemProgram: new web3.PublicKey("11111111111111111111111111111111"),
      source: args.source,
      mint: args.mint,
      destination: args.destination,
      authority: args.authority,
      tokenProgram: new web3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
    })
    .remainingAccounts(remainingAccounts);
};

/**
 * ### Returns a {@link web3.TransactionInstruction}
 * Purchase a subscription pass (monthly or yearly)
 *
 * Accounts:
 * 0. `[writable, signer]` fee_payer: {@link PublicKey}
 * 1. `[]` fare_config: {@link FareConfig} Fare configuration account
 * 2. `[writable]` passenger: {@link Passenger}
 * 3. `[signer]` user: {@link PublicKey} User's wallet address
 * 4. `[writable]` user_token_account: {@link PublicKey} User's token account for payment
 * 5. `[writable]` system_token_account: {@link PublicKey} System's token account for receiving payment
 * 6. `[]` currency_mint: {@link Mint} Currency mint address
 * 7. `[]` system_program: {@link PublicKey} Auto-generated, for account initialization
 * 8. `[writable]` source: {@link PublicKey} The source account.
 * 9. `[]` mint: {@link Mint} The token mint.
 * 10. `[writable]` destination: {@link PublicKey} The destination account.
 * 11. `[signer]` authority: {@link PublicKey} The source account's owner/delegate.
 * 12. `[]` token_program: {@link PublicKey} Auto-generated, TokenProgram
 *
 * Data:
 * - subscription_type: {@link number} Subscription type (1 = monthly, 2 = yearly)
 */
export const purchaseSubscription = (
	args: PurchaseSubscriptionArgs,
	remainingAccounts: Array<web3.AccountMeta> = [],
): Promise<web3.TransactionInstruction> =>
    purchaseSubscriptionBuilder(args, remainingAccounts).instruction();

/**
 * ### Returns a {@link web3.TransactionSignature}
 * Purchase a subscription pass (monthly or yearly)
 *
 * Accounts:
 * 0. `[writable, signer]` fee_payer: {@link PublicKey}
 * 1. `[]` fare_config: {@link FareConfig} Fare configuration account
 * 2. `[writable]` passenger: {@link Passenger}
 * 3. `[signer]` user: {@link PublicKey} User's wallet address
 * 4. `[writable]` user_token_account: {@link PublicKey} User's token account for payment
 * 5. `[writable]` system_token_account: {@link PublicKey} System's token account for receiving payment
 * 6. `[]` currency_mint: {@link Mint} Currency mint address
 * 7. `[]` system_program: {@link PublicKey} Auto-generated, for account initialization
 * 8. `[writable]` source: {@link PublicKey} The source account.
 * 9. `[]` mint: {@link Mint} The token mint.
 * 10. `[writable]` destination: {@link PublicKey} The destination account.
 * 11. `[signer]` authority: {@link PublicKey} The source account's owner/delegate.
 * 12. `[]` token_program: {@link PublicKey} Auto-generated, TokenProgram
 *
 * Data:
 * - subscription_type: {@link number} Subscription type (1 = monthly, 2 = yearly)
 */
export const purchaseSubscriptionSendAndConfirm = async (
  args: Omit<PurchaseSubscriptionArgs, "feePayer" | "user" | "authority"> & {
    signers: {
      feePayer: web3.Signer,
      user: web3.Signer,
      authority: web3.Signer,
    },
  },
  remainingAccounts: Array<web3.AccountMeta> = [],
): Promise<web3.TransactionSignature> => {
  const preInstructions: Array<web3.TransactionInstruction> = [];

  return purchaseSubscriptionBuilder({
      ...args,
      feePayer: args.signers.feePayer.publicKey,
      user: args.signers.user.publicKey,
      authority: args.signers.authority.publicKey,
    }, remainingAccounts)
    .preInstructions(preInstructions)
    .signers([args.signers.feePayer, args.signers.user, args.signers.authority])
    .rpc();
}

export type UseSubscriptionRideArgs = {
  feePayer: web3.PublicKey;
  user: web3.PublicKey;
};

/**
 * ### Returns a {@link MethodsBuilder}
 * Use a subscription ride (requires active subscription)
 *
 * Accounts:
 * 0. `[writable, signer]` fee_payer: {@link PublicKey}
 * 1. `[writable]` passenger: {@link Passenger}
 * 2. `[signer]` user: {@link PublicKey} User's wallet address
 *
 * Data:
 * (none)
 */
export const useSubscriptionRideBuilder = (
	args: UseSubscriptionRideArgs,
	remainingAccounts: Array<web3.AccountMeta> = [],
): MethodsBuilder<TransitFarePayment, never> => {
  const [passengerPubkey] = pda.derivePassengerPDA({
      user: args.user,
  }, _program.programId);

  return _program
    .methods
    .useSubscriptionRide()
    .accountsStrict({
      feePayer: args.feePayer,
      passenger: passengerPubkey,
      user: args.user,
    })
    .remainingAccounts(remainingAccounts);
};

/**
 * ### Returns a {@link web3.TransactionInstruction}
 * Use a subscription ride (requires active subscription)
 *
 * Accounts:
 * 0. `[writable, signer]` fee_payer: {@link PublicKey}
 * 1. `[writable]` passenger: {@link Passenger}
 * 2. `[signer]` user: {@link PublicKey} User's wallet address
 *
 * Data:
 * (none)
 */
export const useSubscriptionRide = (
	args: UseSubscriptionRideArgs,
	remainingAccounts: Array<web3.AccountMeta> = [],
): Promise<web3.TransactionInstruction> =>
    useSubscriptionRideBuilder(args, remainingAccounts).instruction();

/**
 * ### Returns a {@link web3.TransactionSignature}
 * Use a subscription ride (requires active subscription)
 *
 * Accounts:
 * 0. `[writable, signer]` fee_payer: {@link PublicKey}
 * 1. `[writable]` passenger: {@link Passenger}
 * 2. `[signer]` user: {@link PublicKey} User's wallet address
 *
 * Data:
 * (none)
 */
export const useSubscriptionRideSendAndConfirm = async (
  args: Omit<UseSubscriptionRideArgs, "feePayer" | "user"> & {
    signers: {
      feePayer: web3.Signer,
      user: web3.Signer,
    },
  },
  remainingAccounts: Array<web3.AccountMeta> = [],
): Promise<web3.TransactionSignature> => {
  const preInstructions: Array<web3.TransactionInstruction> = [];

  return useSubscriptionRideBuilder({
      ...args,
      feePayer: args.signers.feePayer.publicKey,
      user: args.signers.user.publicKey,
    }, remainingAccounts)
    .preInstructions(preInstructions)
    .signers([args.signers.feePayer, args.signers.user])
    .rpc();
}

export type CancelSubscriptionArgs = {
  feePayer: web3.PublicKey;
  user: web3.PublicKey;
  userTokenAccount: web3.PublicKey;
  systemTokenAccount: web3.PublicKey;
  currencyMint: web3.PublicKey;
  source: web3.PublicKey;
  mint: web3.PublicKey;
  destination: web3.PublicKey;
  authority: web3.PublicKey;
};

/**
 * ### Returns a {@link MethodsBuilder}
 * Cancel an active subscription and receive pro-rated refund
 *
 * Accounts:
 * 0. `[writable, signer]` fee_payer: {@link PublicKey}
 * 1. `[]` fare_config: {@link FareConfig} Fare configuration account
 * 2. `[writable]` passenger: {@link Passenger}
 * 3. `[signer]` user: {@link PublicKey} User's wallet address
 * 4. `[writable]` user_token_account: {@link PublicKey} User's token account for refund
 * 5. `[writable]` system_token_account: {@link PublicKey} System's token account for refund
 * 6. `[]` currency_mint: {@link Mint} Currency mint address
 * 7. `[writable]` source: {@link PublicKey} The source account.
 * 8. `[]` mint: {@link Mint} The token mint.
 * 9. `[writable]` destination: {@link PublicKey} The destination account.
 * 10. `[signer]` authority: {@link PublicKey} The source account's owner/delegate.
 * 11. `[]` token_program: {@link PublicKey} Auto-generated, TokenProgram
 *
 * Data:
 * (none)
 */
export const cancelSubscriptionBuilder = (
	args: CancelSubscriptionArgs,
	remainingAccounts: Array<web3.AccountMeta> = [],
): MethodsBuilder<TransitFarePayment, never> => {
  const [fareConfigPubkey] = pda.deriveFareConfigPDA(_program.programId);
  const [passengerPubkey] = pda.derivePassengerPDA({
      user: args.user,
  }, _program.programId);

  return _program
    .methods
    .cancelSubscription()
    .accountsStrict({
      feePayer: args.feePayer,
      fareConfig: fareConfigPubkey,
      passenger: passengerPubkey,
      user: args.user,
      userTokenAccount: args.userTokenAccount,
      systemTokenAccount: args.systemTokenAccount,
      currencyMint: args.currencyMint,
      source: args.source,
      mint: args.mint,
      destination: args.destination,
      authority: args.authority,
      tokenProgram: new web3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
    })
    .remainingAccounts(remainingAccounts);
};

/**
 * ### Returns a {@link web3.TransactionInstruction}
 * Cancel an active subscription and receive pro-rated refund
 *
 * Accounts:
 * 0. `[writable, signer]` fee_payer: {@link PublicKey}
 * 1. `[]` fare_config: {@link FareConfig} Fare configuration account
 * 2. `[writable]` passenger: {@link Passenger}
 * 3. `[signer]` user: {@link PublicKey} User's wallet address
 * 4. `[writable]` user_token_account: {@link PublicKey} User's token account for refund
 * 5. `[writable]` system_token_account: {@link PublicKey} System's token account for refund
 * 6. `[]` currency_mint: {@link Mint} Currency mint address
 * 7. `[writable]` source: {@link PublicKey} The source account.
 * 8. `[]` mint: {@link Mint} The token mint.
 * 9. `[writable]` destination: {@link PublicKey} The destination account.
 * 10. `[signer]` authority: {@link PublicKey} The source account's owner/delegate.
 * 11. `[]` token_program: {@link PublicKey} Auto-generated, TokenProgram
 *
 * Data:
 * (none)
 */
export const cancelSubscription = (
	args: CancelSubscriptionArgs,
	remainingAccounts: Array<web3.AccountMeta> = [],
): Promise<web3.TransactionInstruction> =>
    cancelSubscriptionBuilder(args, remainingAccounts).instruction();

/**
 * ### Returns a {@link web3.TransactionSignature}
 * Cancel an active subscription and receive pro-rated refund
 *
 * Accounts:
 * 0. `[writable, signer]` fee_payer: {@link PublicKey}
 * 1. `[]` fare_config: {@link FareConfig} Fare configuration account
 * 2. `[writable]` passenger: {@link Passenger}
 * 3. `[signer]` user: {@link PublicKey} User's wallet address
 * 4. `[writable]` user_token_account: {@link PublicKey} User's token account for refund
 * 5. `[writable]` system_token_account: {@link PublicKey} System's token account for refund
 * 6. `[]` currency_mint: {@link Mint} Currency mint address
 * 7. `[writable]` source: {@link PublicKey} The source account.
 * 8. `[]` mint: {@link Mint} The token mint.
 * 9. `[writable]` destination: {@link PublicKey} The destination account.
 * 10. `[signer]` authority: {@link PublicKey} The source account's owner/delegate.
 * 11. `[]` token_program: {@link PublicKey} Auto-generated, TokenProgram
 *
 * Data:
 * (none)
 */
export const cancelSubscriptionSendAndConfirm = async (
  args: Omit<CancelSubscriptionArgs, "feePayer" | "user" | "authority"> & {
    signers: {
      feePayer: web3.Signer,
      user: web3.Signer,
      authority: web3.Signer,
    },
  },
  remainingAccounts: Array<web3.AccountMeta> = [],
): Promise<web3.TransactionSignature> => {
  const preInstructions: Array<web3.TransactionInstruction> = [];

  return cancelSubscriptionBuilder({
      ...args,
      feePayer: args.signers.feePayer.publicKey,
      user: args.signers.user.publicKey,
      authority: args.signers.authority.publicKey,
    }, remainingAccounts)
    .preInstructions(preInstructions)
    .signers([args.signers.feePayer, args.signers.user, args.signers.authority])
    .rpc();
}

// Getters

export const getFareConfig = (
    publicKey: web3.PublicKey,
    commitment?: web3.Commitment
): Promise<IdlAccounts<TransitFarePayment>["fareConfig"]> => _program.account.fareConfig.fetch(publicKey, commitment);

export const getPassenger = (
    publicKey: web3.PublicKey,
    commitment?: web3.Commitment
): Promise<IdlAccounts<TransitFarePayment>["passenger"]> => _program.account.passenger.fetch(publicKey, commitment);

export const getTicket = (
    publicKey: web3.PublicKey,
    commitment?: web3.Commitment
): Promise<IdlAccounts<TransitFarePayment>["ticket"]> => _program.account.ticket.fetch(publicKey, commitment);

export const getPayment = (
    publicKey: web3.PublicKey,
    commitment?: web3.Commitment
): Promise<IdlAccounts<TransitFarePayment>["payment"]> => _program.account.payment.fetch(publicKey, commitment);
