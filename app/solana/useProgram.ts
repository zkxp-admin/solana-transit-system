import { AnchorProvider } from "@coral-xyz/anchor";
import {
  Keypair,
  PublicKey,
  type AccountMeta,
  type TransactionInstruction,
  type TransactionSignature,
} from "@solana/web3.js";
import { useCallback, useState, useEffect } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import * as programClient from "~/solana/client";

// Props interface for the useProgram hook
export interface UseProgramProps {
  // Optional override for the VITE_SOLANA_PROGRAM_ID env var
  programId?: string;
}

// Error structure returned from sendAndConfirmTx if transaction fails
type SendAndConfirmTxError = {
  message: string;
  logs: string[];
  stack: string | undefined;
};

// Result structure returned from sendAndConfirmTx
type SendAndConfirmTxResult = {
  // Signature of successful transaction
  signature?: string;

  // Error details if transaction fails
  error?: SendAndConfirmTxError;
};

// Helper function to send and confirm a transaction, with error handling
const sendAndConfirmTx = async (
  fn: () => Promise<TransactionSignature>,
): Promise<SendAndConfirmTxResult> => {
  try {
    const signature = await fn();
    return {
      signature,
    };
  } catch (e: any) {
    let message = `An unknown error occurred: ${e}`;
    let logs = [];
    let stack = "";

    if ("logs" in e && e.logs instanceof Array) {
      logs = e.logs;
    }

    if ("stack" in e) {
      stack = e.stack;
    }

    if ("message" in e) {
      message = e.message;
    }

    return {
      error: {
        logs,
        stack,
        message,
      },
    };
  }
};

const useProgram = (props?: UseProgramProps | undefined) => {
  const [programId, setProgramId] = useState<PublicKey|undefined>(undefined)
  const { connection } = useConnection();

  useEffect(() => {
    let prgId = import.meta.env.VITE_SOLANA_PROGRAM_ID as string | undefined;

    if (props?.programId) {
      prgId = props.programId;
    }

    if (!prgId) {
      throw new Error(
        "the program id must be provided either by the useProgram props or the env var VITE_SOLANA_PROGRAM_ID",
      );
    }

    const pid = new PublicKey(prgId)
    setProgramId(pid)
    programClient.initializeClient(pid, new AnchorProvider(connection));
  }, [props?.programId, connection.rpcEndpoint]);

  /**
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
   *
   * @returns {@link TransactionInstruction}
   */
  const initializeFareConfig = useCallback(programClient.initializeFareConfig, [])

  /**
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
   *
   * @returns {@link SendAndConfirmTxResult}
   */
  const initializeFareConfigSendAndConfirm = useCallback(async (
    args: Omit<programClient.InitializeFareConfigArgs, "feePayer" | "admin"> & {
    signers: {
        feePayer: Keypair,
        admin: Keypair,
    }}, 
    remainingAccounts: Array<AccountMeta> = []
  ): Promise<SendAndConfirmTxResult> => sendAndConfirmTx(() => programClient.initializeFareConfigSendAndConfirm(args, remainingAccounts)), [])

  /**
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
   *
   * @returns {@link TransactionInstruction}
   */
  const updateFareConfig = useCallback(programClient.updateFareConfig, [])

  /**
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
   *
   * @returns {@link SendAndConfirmTxResult}
   */
  const updateFareConfigSendAndConfirm = useCallback(async (
    args: Omit<programClient.UpdateFareConfigArgs, "feePayer" | "admin"> & {
    signers: {
        feePayer: Keypair,
        admin: Keypair,
    }}, 
    remainingAccounts: Array<AccountMeta> = []
  ): Promise<SendAndConfirmTxResult> => sendAndConfirmTx(() => programClient.updateFareConfigSendAndConfirm(args, remainingAccounts)), [])

  /**
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
   *
   * @returns {@link TransactionInstruction}
   */
  const purchaseTicket = useCallback(programClient.purchaseTicket, [])

  /**
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
   *
   * @returns {@link SendAndConfirmTxResult}
   */
  const purchaseTicketSendAndConfirm = useCallback(async (
    args: Omit<programClient.PurchaseTicketArgs, "feePayer" | "user" | "authority"> & {
    signers: {
        feePayer: Keypair,
        user: Keypair,
        authority: Keypair,
    }}, 
    remainingAccounts: Array<AccountMeta> = []
  ): Promise<SendAndConfirmTxResult> => sendAndConfirmTx(() => programClient.purchaseTicketSendAndConfirm(args, remainingAccounts)), [])

  /**
   * Mark a ticket as used for travel
   *
   * Accounts:
   * 0. `[writable, signer]` fee_payer: {@link PublicKey} 
   * 1. `[writable]` ticket: {@link Ticket} 
   * 2. `[signer]` user: {@link PublicKey} User's wallet address
   *
   * Data:
   * - ticket_id: {@link BigInt} Ticket identifier
   *
   * @returns {@link TransactionInstruction}
   */
  const useTicket = useCallback(programClient.useTicket, [])

  /**
   * Mark a ticket as used for travel
   *
   * Accounts:
   * 0. `[writable, signer]` fee_payer: {@link PublicKey} 
   * 1. `[writable]` ticket: {@link Ticket} 
   * 2. `[signer]` user: {@link PublicKey} User's wallet address
   *
   * Data:
   * - ticket_id: {@link BigInt} Ticket identifier
   *
   * @returns {@link SendAndConfirmTxResult}
   */
  const useTicketSendAndConfirm = useCallback(async (
    args: Omit<programClient.UseTicketArgs, "feePayer" | "user"> & {
    signers: {
        feePayer: Keypair,
        user: Keypair,
    }}, 
    remainingAccounts: Array<AccountMeta> = []
  ): Promise<SendAndConfirmTxResult> => sendAndConfirmTx(() => programClient.useTicketSendAndConfirm(args, remainingAccounts)), [])

  /**
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
   *
   * @returns {@link TransactionInstruction}
   */
  const refundTicket = useCallback(programClient.refundTicket, [])

  /**
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
   *
   * @returns {@link SendAndConfirmTxResult}
   */
  const refundTicketSendAndConfirm = useCallback(async (
    args: Omit<programClient.RefundTicketArgs, "feePayer" | "user" | "authority"> & {
    signers: {
        feePayer: Keypair,
        user: Keypair,
        authority: Keypair,
    }}, 
    remainingAccounts: Array<AccountMeta> = []
  ): Promise<SendAndConfirmTxResult> => sendAndConfirmTx(() => programClient.refundTicketSendAndConfirm(args, remainingAccounts)), [])

  /**
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
   *
   * @returns {@link TransactionInstruction}
   */
  const recordPayment = useCallback(programClient.recordPayment, [])

  /**
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
   *
   * @returns {@link SendAndConfirmTxResult}
   */
  const recordPaymentSendAndConfirm = useCallback(async (
    args: Omit<programClient.RecordPaymentArgs, "feePayer" | "user"> & {
    signers: {
        feePayer: Keypair,
        user: Keypair,
    }}, 
    remainingAccounts: Array<AccountMeta> = []
  ): Promise<SendAndConfirmTxResult> => sendAndConfirmTx(() => programClient.recordPaymentSendAndConfirm(args, remainingAccounts)), [])


  /**
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
   *
   * @returns {@link TransactionInstruction}
   */
  const purchaseSubscription = useCallback(programClient.purchaseSubscription, [])

  /**
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
   *
   * @returns {@link SendAndConfirmTxResult}
   */
  const purchaseSubscriptionSendAndConfirm = useCallback(async (
    args: Omit<programClient.PurchaseSubscriptionArgs, "feePayer" | "user" | "authority"> & {
    signers: {
        feePayer: Keypair,
        user: Keypair,
        authority: Keypair,
    }},
    remainingAccounts: Array<AccountMeta> = []
  ): Promise<SendAndConfirmTxResult> => sendAndConfirmTx(() => programClient.purchaseSubscriptionSendAndConfirm(args, remainingAccounts)), [])

  /**
   * Use a subscription ride (requires active subscription)
   *
   * Accounts:
   * 0. `[writable, signer]` fee_payer: {@link PublicKey}
   * 1. `[writable]` passenger: {@link Passenger}
   * 2. `[signer]` user: {@link PublicKey} User's wallet address
   *
   * Data:
   * (none)
   *
   * @returns {@link TransactionInstruction}
   */
  const useSubscriptionRide = useCallback(programClient.useSubscriptionRide, [])

  /**
   * Use a subscription ride (requires active subscription)
   *
   * Accounts:
   * 0. `[writable, signer]` fee_payer: {@link PublicKey}
   * 1. `[writable]` passenger: {@link Passenger}
   * 2. `[signer]` user: {@link PublicKey} User's wallet address
   *
   * Data:
   * (none)
   *
   * @returns {@link SendAndConfirmTxResult}
   */
  const useSubscriptionRideSendAndConfirm = useCallback(async (
    args: Omit<programClient.UseSubscriptionRideArgs, "feePayer" | "user"> & {
    signers: {
        feePayer: Keypair,
        user: Keypair,
    }},
    remainingAccounts: Array<AccountMeta> = []
  ): Promise<SendAndConfirmTxResult> => sendAndConfirmTx(() => programClient.useSubscriptionRideSendAndConfirm(args, remainingAccounts)), [])

  /**
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
   *
   * @returns {@link TransactionInstruction}
   */
  const cancelSubscription = useCallback(programClient.cancelSubscription, [])

  /**
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
   *
   * @returns {@link SendAndConfirmTxResult}
   */
  const cancelSubscriptionSendAndConfirm = useCallback(async (
    args: Omit<programClient.CancelSubscriptionArgs, "feePayer" | "user" | "authority"> & {
    signers: {
        feePayer: Keypair,
        user: Keypair,
        authority: Keypair,
    }},
    remainingAccounts: Array<AccountMeta> = []
  ): Promise<SendAndConfirmTxResult> => sendAndConfirmTx(() => programClient.cancelSubscriptionSendAndConfirm(args, remainingAccounts)), [])


  const getFareConfig = useCallback(programClient.getFareConfig, [])
  const getPassenger = useCallback(programClient.getPassenger, [])
  const getTicket = useCallback(programClient.getTicket, [])
  const getPayment = useCallback(programClient.getPayment, [])

  const deriveFareConfig = useCallback(programClient.deriveFareConfigPDA,[])
  const derivePassenger = useCallback(programClient.derivePassengerPDA,[])
  const deriveTicket = useCallback(programClient.deriveTicketPDA,[])
  const derivePayment = useCallback(programClient.derivePaymentPDA,[])
  const deriveAccountFromTokenProgram = useCallback(programClient.TokenProgramPDAs.deriveAccountPDA, [])

  return {
	programId,
    initializeFareConfig,
    initializeFareConfigSendAndConfirm,
    updateFareConfig,
    updateFareConfigSendAndConfirm,
    purchaseTicket,
    purchaseTicketSendAndConfirm,
    useTicket,
    useTicketSendAndConfirm,
    refundTicket,
    refundTicketSendAndConfirm,
    recordPayment,
    recordPaymentSendAndConfirm,
    purchaseSubscription,
    purchaseSubscriptionSendAndConfirm,
    useSubscriptionRide,
    useSubscriptionRideSendAndConfirm,
    cancelSubscription,
    cancelSubscriptionSendAndConfirm,
    getFareConfig,
    getPassenger,
    getTicket,
    getPayment,
    deriveFareConfig,
    derivePassenger,
    deriveTicket,
    derivePayment,
    deriveAccountFromTokenProgram,
  };
};

export { useProgram };