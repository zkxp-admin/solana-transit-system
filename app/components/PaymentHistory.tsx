import React, { useState, useEffect } from 'react';
import { useProgram } from '~/solana/useProgram';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

interface PaymentHistoryProps {
  userAddress: string;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ userAddress }) => {
  const { getPayment } = useProgram();
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (!userAddress) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // In a real implementation, we would fetch actual payment history
        // For now, we'll simulate with mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock payment history data including subscriptions
        const mockPayments = [
          {
            id: 1,
            amount: 0.50,
            currency: 'SOL',
            timestamp: '2023-05-15T10:30:00Z',
            transactionHash: 'abc123...',
            type: 'Yearly Pass',
            isSubscription: true,
            description: 'Yearly Subscription Purchase'
          },
          {
            id: 2,
            amount: 0.05,
            currency: 'SOL',
            timestamp: '2023-05-14T14:15:00Z',
            transactionHash: 'def456...',
            type: 'Train',
            isSubscription: false,
            description: 'Train Ticket'
          },
          {
            id: 3,
            amount: 0.05,
            currency: 'SOL',
            timestamp: '2023-05-13T09:45:00Z',
            transactionHash: 'ghi789...',
            type: 'Bus',
            isSubscription: false,
            description: 'Bus Ticket'
          },
          {
            id: 4,
            amount: 0.10,
            currency: 'SOL',
            timestamp: '2023-05-12T11:20:00Z',
            transactionHash: 'jkl012...',
            type: 'Refund',
            isSubscription: true,
            description: 'Subscription Refund (Canceled)'
          }
        ];
        
        setPayments(mockPayments);
      } catch (err) {
        console.error('Failed to fetch payment history:', err);
        setError('Failed to load payment history. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [userAddress]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center mb-6">
          <div className="bg-indigo-100 p-2 rounded-lg mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Payment History</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <div className="bg-gray-200 rounded-full w-10 h-10 mr-3"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center mb-6">
          <div className="bg-indigo-100 p-2 rounded-lg mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Payment History</h2>
        </div>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
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
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <div className="bg-indigo-100 p-2 rounded-lg mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800">Payment History</h2>
      </div>
      
      {payments.length === 0 ? (
        <div className="text-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No payment history</h3>
          <p className="mt-1 text-gray-500">You haven't made any payments yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                payment.isSubscription ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-full mr-3 ${
                  payment.isSubscription ? 'bg-indigo-100' : 'bg-gray-100'
                }`}>
                  {payment.isSubscription ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${payment.isSubscription ? 'text-indigo-600' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{payment.description}</h3>
                    {payment.isSubscription && (
                      <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
                        payment.type === 'Refund'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {payment.type}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(payment.timestamp).toLocaleDateString()} at {new Date(payment.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${payment.type === 'Refund' ? 'text-green-600' : 'text-gray-900'}`}>
                  {payment.type === 'Refund' ? '+' : ''}{payment.amount} {payment.currency}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-[100px]">{payment.transactionHash}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;