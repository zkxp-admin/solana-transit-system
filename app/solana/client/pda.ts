import {PublicKey} from "@solana/web3.js";
import BN from "bn.js";

export const deriveFareConfigPDA = (programId: PublicKey): [PublicKey, number] => {
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from("fare_config"),
        ],
        programId,
    )
};

export type PassengerSeeds = {
    user: PublicKey, 
};

export const derivePassengerPDA = (
    seeds: PassengerSeeds,
    programId: PublicKey
): [PublicKey, number] => {
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from("passenger"),
            seeds.user.toBuffer(),
        ],
        programId,
    )
};

export type TicketSeeds = {
    user: PublicKey, 
    ticketId: bigint, 
};

export const deriveTicketPDA = (
    seeds: TicketSeeds,
    programId: PublicKey
): [PublicKey, number] => {
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from("ticket"),
            seeds.user.toBuffer(),
            Buffer.from(Buffer.from(new BN(seeds.ticketId.toString()).toArray("le", 8))),
        ],
        programId,
    )
};

export type PaymentSeeds = {
    user: PublicKey, 
    paymentId: bigint, 
};

export const derivePaymentPDA = (
    seeds: PaymentSeeds,
    programId: PublicKey
): [PublicKey, number] => {
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from("payment"),
            seeds.user.toBuffer(),
            Buffer.from(Buffer.from(new BN(seeds.paymentId.toString()).toArray("le", 8))),
        ],
        programId,
    )
};

export module TokenProgramPDAs {
    export type AccountSeeds = {
        wallet: PublicKey, 
        tokenProgram: PublicKey, 
        mint: PublicKey, 
    };
    
    export const deriveAccountPDA = (
        seeds: AccountSeeds,
        programId: PublicKey
    ): [PublicKey, number] => {
        return PublicKey.findProgramAddressSync(
            [
                seeds.wallet.toBuffer(),
                seeds.tokenProgram.toBuffer(),
                seeds.mint.toBuffer(),
            ],
            programId,
        )
    };
    
}

