'use client';

import type { IdlAccounts } from '@coral-xyz/anchor';
import type { TransitFarePayment } from '~/solana/types/transit_fare_payment';

type PassengerAccount = IdlAccounts<TransitFarePayment>["passenger"];

interface SubscriptionStatusProps {
  passengerData: PassengerAccount | null;
  isLoading: boolean;
}

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

const calculateProgressPercentage = (daysRemaining: number, totalDays: number): number => {
  return Math.min((daysRemaining / totalDays) * 100, 100);
};

export function SubscriptionStatus({ passengerData, isLoading }: SubscriptionStatusProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const hasActiveSubscription = passengerData?.subscriptionType !== 0 &&
    passengerData &&
    passengerData.subscriptionEnd > Math.floor(Date.now() / 1000);

  if (!hasActiveSubscription || !passengerData) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <div className="text-gray-400 mb-3">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">No Active Subscription</h3>
        <p className="text-sm text-gray-600">Purchase a pass to start enjoying unlimited rides</p>
      </div>
    );
  }

  const subscriptionTypeLabel = passengerData.subscriptionType === 1 ? 'Monthly Pass' : 'Yearly Pass';
  const totalDays = passengerData.subscriptionType === 1 ? 30 : 365;
  const daysRemaining = calculateDaysRemaining(passengerData.subscriptionEnd);
  const progressPercentage = calculateProgressPercentage(daysRemaining, totalDays);

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-lg p-6 space-y-4 border border-indigo-200">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-indigo-900">Active Subscription</h3>
          <p className="text-indigo-700 font-semibold mt-1">{subscriptionTypeLabel}</p>
        </div>
        <div className="bg-green-100 rounded-full p-2">
          <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-indigo-700">Expires: {formatDate(passengerData.subscriptionEnd)}</span>
          <span className="font-semibold text-indigo-900">{daysRemaining} days</span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-indigo-600">
            <span>Time Remaining</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-indigo-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-600 to-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-indigo-200">
        <p className="text-sm text-indigo-700">
          <span className="font-semibold">Rides Used:</span> {passengerData.subscriptionRidesUsed} <span className="text-indigo-600">(Unlimited)</span>
        </p>
      </div>

      {daysRemaining <= 7 && daysRemaining > 0 && (
        <div className="bg-yellow-100 border-l-4 border-yellow-400 p-3 rounded">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">⚠ Renewal reminder:</span> Your subscription expires in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
          </p>
        </div>
      )}

      {daysRemaining === 0 && (
        <div className="bg-red-100 border-l-4 border-red-400 p-3 rounded">
          <p className="text-sm text-red-800">
            <span className="font-semibold">Subscription expired</span> - Please renew to continue using unlimited rides
          </p>
        </div>
      )}
    </div>
  );
}
