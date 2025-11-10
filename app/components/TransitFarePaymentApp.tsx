import React, { useState, useEffect } from 'react';
import { useProgram } from '~/solana/useProgram';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Keypair } from '@solana/web3.js';
import { SubscriptionManager } from './SubscriptionManager';
import { SubscriptionStatus } from './SubscriptionStatus';
import FareSelection from './FareSelection';
import PaymentHistory from './PaymentHistory';
import TreasuryBalance from './TreasuryBalance';
import type { IdlAccounts } from '@coral-xyz/anchor';
import type { TransitFarePayment } from '~/solana/types/transit_fare_payment';

type PassengerAccount = IdlAccounts<TransitFarePayment>["passenger"];
type FareConfigAccount = IdlAccounts<TransitFarePayment>["fareConfig"];

const TransitFarePaymentApp = () => {
  const { publicKey, connected, disconnect } = useWallet();
  const { getFareConfig, getPassenger, derivePassenger, deriveFareConfig } = useProgram();
  const [isLoading, setIsLoading] = useState(false);
  const [fareConfigData, setFareConfigData] = useState<FareConfigAccount | null>(null);
  const [passengerData, setPassengerData] = useState<PassengerAccount | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!publicKey) return;

      try {
        setError(null);
        const programId = new PublicKey(import.meta.env.VITE_SOLANA_PROGRAM_ID!);

        // Fetch fare configuration
        const [fareConfigPda] = deriveFareConfig(programId);
        const config = await getFareConfig(fareConfigPda);
        setFareConfigData(config);

        // Fetch passenger data
        const [passengerPda] = derivePassenger({ user: publicKey }, programId);
        try {
          const passenger = await getPassenger(passengerPda);
          setPassengerData(passenger);
        } catch (err) {
          // Passenger account may not exist yet
          console.log('Passenger account not initialized');
          setPassengerData(null);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load configuration. Please try again.');
      }
    };

    if (connected) {
      fetchData();
    }
  }, [connected, publicKey, getFareConfig, getPassenger, derivePassenger, deriveFareConfig]);

  const handlePurchase = async (transportMode: 0 | 1, amount: number) => {
    if (!publicKey) {
      setError('Please connect your wallet first');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, we would:
      // 1. Create a transaction to purchase a ticket
      // 2. Send it to the Solana network
      // 3. Handle the response
      
      // Mock success with a realistic delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const modeName = transportMode === 0 ? 'Mode 0' : 'Mode 1';
      alert(`Successfully purchased ${modeName} transit ticket for ${amount / 1e9} SOL!`);
    } catch (err) {
      console.error('Purchase failed:', err);
      setError('Purchase failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Transit Fare Payment</h1>
            <p className="text-gray-600">Connect your wallet to access the payment system</p>
          </div>
          
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded-lg w-full mb-4"></div>
          </div>
          
          <div className="mt-6">
            <p className="text-sm text-gray-500 mb-4">Supported wallets:</p>
            <div className="flex justify-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-indigo-600 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Transit Fare Payment</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden sm:block">
                Connected: {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
              </span>
              <button
                onClick={() => disconnect()}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Subscriptions and Fare Selection */}
          <div className="lg:col-span-1 space-y-8">
            <SubscriptionManager
              passengerData={passengerData}
              fareConfig={fareConfigData}
              isLoading={isLoading}
              onSubscriptionPurchased={() => {
                // Refetch passenger data after purchase
                if (publicKey && fareConfigData) {
                  const programId = new PublicKey(import.meta.env.VITE_SOLANA_PROGRAM_ID!);
                  const [passengerPda] = derivePassenger({ user: publicKey }, programId);
                  getPassenger(passengerPda).then(passenger => setPassengerData(passenger)).catch(() => {});
                }
              }}
              onSubscriptionCanceled={() => {
                // Refetch passenger data after cancellation
                if (publicKey && fareConfigData) {
                  const programId = new PublicKey(import.meta.env.VITE_SOLANA_PROGRAM_ID!);
                  const [passengerPda] = derivePassenger({ user: publicKey }, programId);
                  getPassenger(passengerPda).then(passenger => setPassengerData(passenger)).catch(() => {});
                }
              }}
            />
            <SubscriptionStatus passengerData={passengerData} isLoading={isLoading} />
            <FareSelection
              onPurchase={handlePurchase}
              isLoading={isLoading}
              mode0Fare={fareConfigData?.mode0Fare || 0n}
              mode1Fare={fareConfigData?.mode1Fare || 0n}
              hasActiveSubscription={
                passengerData?.subscriptionType !== 0 &&
                passengerData &&
                passengerData.subscriptionEnd > Math.floor(Date.now() / 1000)
              }
              passengerData={passengerData}
            />
          </div>

          {/* Right Column - Payment History and Treasury */}
          <div className="lg:col-span-2 space-y-8">
            <PaymentHistory userAddress={publicKey?.toBase58() || ''} />
            <TreasuryBalance programId={import.meta.env.VITE_SOLANA_PROGRAM_ID!} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default TransitFarePaymentApp;