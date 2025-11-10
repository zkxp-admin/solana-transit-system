import React, { useState, useEffect } from 'react';
import { useProgram } from '~/solana/useProgram';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import type { IdlAccounts } from '@coral-xyz/anchor';
import type { TransitFarePayment } from '~/solana/types/transit_fare_payment';

type PassengerAccount = IdlAccounts<TransitFarePayment>["passenger"];

interface FareSelectionProps {
  onPurchase: (transportMode: 0 | 1, amount: number) => void;
  isLoading: boolean;
  mode0Fare: bigint;
  mode1Fare: bigint;
  hasActiveSubscription?: boolean;
  passengerData?: PassengerAccount | null;
}

const FareSelection: React.FC<FareSelectionProps> = ({
  onPurchase,
  isLoading,
  mode0Fare,
  mode1Fare,
  hasActiveSubscription = false,
  passengerData
}) => {
  const [selectedMode, setSelectedMode] = useState<0 | 1 | null>(null);
  const [fareAmount, setFareAmount] = useState<bigint>(0n);
  const { publicKey } = useWallet();
  const { purchaseTicketSendAndConfirm } = useProgram();

  useEffect(() => {
    if (selectedMode === 0) {
      setFareAmount(mode0Fare);
    } else if (selectedMode === 1) {
      setFareAmount(mode1Fare);
    }
  }, [selectedMode, mode0Fare, mode1Fare]);

  const handleSelectMode = (mode: 0 | 1) => {
    setSelectedMode(mode);
  };

  const handlePurchase = async () => {
    if (selectedMode === null || fareAmount <= 0n || !publicKey) {
      return;
    }

    try {
      // In a real implementation, we would:
      // 1. Create a transaction to purchase a ticket
      // 2. Send it to the Solana network
      // 3. Handle the response

      // Mock success with a realistic delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const modeName = selectedMode === 0 ? 'Bus' : 'Train';
      alert(`Successfully purchased ${modeName} transit ticket for ${Number(fareAmount) / 1e9} SOL!`);
    } catch (err) {
      console.error('Purchase failed:', err);
      alert('Purchase failed. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-indigo-100 p-2 rounded-lg mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Select Transit Mode</h2>
        </div>
        {hasActiveSubscription && (
          <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
            Subscription Active
          </span>
        )}
      </div>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={() => handleSelectMode(0)}
          className={`w-full py-4 px-4 rounded-lg border-2 transition-all flex items-center justify-between ${
            selectedMode === 0
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-200 hover:border-indigo-300'
          }`}
        >
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">Bus (Mode 0)</h3>
              <p className="text-sm text-gray-600">Transit by bus</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-800">{Number(mode0Fare) / 1e9} SOL</p>
          </div>
        </button>

        <button
          onClick={() => handleSelectMode(1)}
          className={`w-full py-4 px-4 rounded-lg border-2 transition-all flex items-center justify-between ${
            selectedMode === 1
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-green-300'
          }`}
        >
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">Train (Mode 1)</h3>
              <p className="text-sm text-gray-600">Transit by train</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-800">{Number(mode1Fare) / 1e9} SOL</p>
          </div>
        </button>
      </div>

      {selectedMode !== null && (
        <div className={`rounded-lg p-4 mb-6 ${hasActiveSubscription ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Selected:</span>
            <span className="font-bold text-gray-800">{selectedMode === 0 ? 'Bus' : 'Train'} (Mode {selectedMode})</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="font-medium text-gray-700">Fare Amount:</span>
            {hasActiveSubscription ? (
              <span className="font-bold text-green-600">FREE with subscription</span>
            ) : (
              <span className="font-bold text-gray-800">{Number(fareAmount) / 1e9} SOL</span>
            )}
          </div>
        </div>
      )}

      <button
        onClick={handlePurchase}
        disabled={selectedMode === null || isLoading}
        className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors flex items-center justify-center ${
          selectedMode !== null && !isLoading
            ? 'bg-indigo-600 hover:bg-indigo-700'
            : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : hasActiveSubscription ? (
          'Use Subscription Ride'
        ) : (
          'Purchase Ticket'
        )}
      </button>
    </div>
  );
};

export default FareSelection;