'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useProgram } from '~/solana/useProgram';
import type { IdlAccounts } from '@coral-xyz/anchor';
import type { TransitFarePayment } from '~/solana/types/transit_fare_payment';

type PassengerAccount = IdlAccounts<TransitFarePayment>["passenger"];
type FareConfigAccount = IdlAccounts<TransitFarePayment>["fareConfig"];

interface SubscriptionManagerProps {
  passengerData: PassengerAccount | null;
  fareConfig: FareConfigAccount | null;
  isLoading: boolean;
  onSubscriptionPurchased?: () => void;
  onSubscriptionCanceled?: () => void;
}

const SUBSCRIPTION_TYPES = {
  MONTHLY: 1,
  YEARLY: 2,
} as const;

const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const calculateDaysRemaining = (endTimestamp: number): number => {
  const now = Math.floor(Date.now() / 1000);
  const remaining = endTimestamp - now;
  return Math.max(0, Math.ceil(remaining / (24 * 60 * 60)));
};

const formatSOL = (lamports: bigint): string => {
  const sol = Number(lamports) / 1e9;
  return `${sol.toFixed(4)} SOL`;
};

export function SubscriptionManager({
  passengerData,
  fareConfig,
  isLoading,
  onSubscriptionPurchased,
  onSubscriptionCanceled,
}: SubscriptionManagerProps) {
  const { publicKey, signTransaction } = useWallet();
  const { purchaseSubscriptionSendAndConfirm, cancelSubscriptionSendAndConfirm } = useProgram();
  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const hasActiveSubscription = passengerData?.subscriptionType !== 0 &&
    passengerData &&
    passengerData.subscriptionEnd > Math.floor(Date.now() / 1000);

  const subscriptionTypeLabel = () => {
    if (!hasActiveSubscription) return null;
    return passengerData?.subscriptionType === 1 ? 'Monthly Pass' : 'Yearly Pass';
  };

  const daysRemaining = hasActiveSubscription && passengerData
    ? calculateDaysRemaining(passengerData.subscriptionEnd)
    : 0;

  const handlePurchaseSubscription = async (subscriptionType: number) => {
    if (!publicKey || !signTransaction || !fareConfig) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // This is a placeholder - actual implementation would require:
      // 1. Getting user token account
      // 2. Getting system token account
      // 3. Creating token transfers
      // In a real implementation, this would call the full subscription purchase flow

      const result = await purchaseSubscriptionSendAndConfirm({
        userTokenAccount: publicKey,
        systemTokenAccount: publicKey,
        currencyMint: fareConfig.currencyMint,
        source: publicKey,
        mint: fareConfig.currencyMint,
        destination: publicKey,
        subscriptionType,
        signers: {
          feePayer: { publicKey } as any,
          user: { publicKey } as any,
          authority: { publicKey } as any,
        },
      });

      if (result.error) {
        setError(`Failed to purchase subscription: ${result.error.message}`);
      } else {
        setSuccess('Subscription purchased successfully!');
        onSubscriptionPurchased?.();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to purchase subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!publicKey || !signTransaction || !fareConfig) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await cancelSubscriptionSendAndConfirm({
        userTokenAccount: publicKey,
        systemTokenAccount: publicKey,
        currencyMint: fareConfig.currencyMint,
        source: publicKey,
        mint: fareConfig.currencyMint,
        destination: publicKey,
        signers: {
          feePayer: { publicKey } as any,
          user: { publicKey } as any,
          authority: { publicKey } as any,
        },
      });

      if (result.error) {
        setError(`Failed to cancel subscription: ${result.error.message}`);
      } else {
        setSuccess('Subscription canceled successfully!');
        setShowCancelModal(false);
        onSubscriptionCanceled?.();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Subscription Passes</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm">{success}</p>
        </div>
      )}

      {hasActiveSubscription && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-indigo-900">{subscriptionTypeLabel()}</span>
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                Active
              </span>
            </div>
            <p className="text-sm text-indigo-700">
              Expires: {formatDate(passengerData!.subscriptionEnd)}
            </p>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-indigo-600">Days Remaining: {daysRemaining}</span>
                <span className="text-indigo-600">{daysRemaining > 0 ? Math.round((daysRemaining / 30) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-indigo-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((daysRemaining / 30) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <p className="text-sm text-indigo-700">
              Rides Used: {passengerData?.subscriptionRidesUsed || 0} (Unlimited)
            </p>
            {daysRemaining <= 7 && daysRemaining > 0 && (
              <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-sm">
                Renewal reminder: Your subscription expires in {daysRemaining} days
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded-lg p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900">Monthly Pass</h3>
            <p className="text-sm text-gray-600">30 days of unlimited rides</p>
          </div>
          <div className="text-2xl font-bold text-indigo-600">
            {fareConfig ? formatSOL(fareConfig.monthlyPassPrice) : '0.00 SOL'}
          </div>
          <button
            onClick={() => handlePurchaseSubscription(SUBSCRIPTION_TYPES.MONTHLY)}
            disabled={loading || isLoading || !publicKey}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
          >
            {loading ? 'Processing...' : 'Purchase Monthly'}
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 space-y-3 relative overflow-hidden">
          <div className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">
            Save 17%
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Yearly Pass</h3>
            <p className="text-sm text-gray-600">365 days of unlimited rides</p>
          </div>
          <div className="text-2xl font-bold text-indigo-600">
            {fareConfig ? formatSOL(fareConfig.yearlyPassPrice) : '0.00 SOL'}
          </div>
          <button
            onClick={() => handlePurchaseSubscription(SUBSCRIPTION_TYPES.YEARLY)}
            disabled={loading || isLoading || !publicKey}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
          >
            {loading ? 'Processing...' : 'Purchase Yearly'}
          </button>
        </div>
      </div>

      {hasActiveSubscription && (
        <button
          onClick={() => setShowCancelModal(true)}
          disabled={loading || isLoading}
          className="w-full py-2 px-4 border-2 border-red-400 text-red-600 hover:bg-red-50 disabled:border-gray-400 disabled:text-gray-400 rounded-lg font-semibold transition-colors"
        >
          Cancel Subscription
        </button>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Cancel Subscription?</h3>
            <p className="text-gray-600 text-sm">
              You will receive a pro-rated refund for the remaining {daysRemaining} days.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-sm text-blue-900">
                Note: Exact refund amount will be calculated based on your subscription type and purchase price.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={loading}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 font-semibold transition-colors"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={loading}
                className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
              >
                {loading ? 'Canceling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
