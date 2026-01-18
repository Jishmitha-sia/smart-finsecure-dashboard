import { useState, useEffect } from 'react';
import { transactionAPI } from '../api/client';

export default function FraudDetection() {
  const [flaggedTransactions, setFlaggedTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFlaggedTransactions();
  }, []);

  const fetchFlaggedTransactions = async () => {
    try {
      const response = await transactionAPI.getFlagged();
      setFlaggedTransactions(response.data.flaggedTransactions || response.data);
    } catch (err) {
      console.error('Failed to fetch flagged transactions:', err);
      setError('Failed to load fraud alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkLegitimate = async (id) => {
    try {
      await transactionAPI.markLegitimate(id);
      fetchFlaggedTransactions();
    } catch (err) {
      setError('Failed to mark transaction as legitimate');
    }
  };

  const totalBlocked = flaggedTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  // fraudScore from ML is already a 0-100 score; do not multiply by 100
  const avgRisk = flaggedTransactions.length > 0
    ? flaggedTransactions.reduce((sum, tx) => sum + (tx.fraudScore || 0), 0) / flaggedTransactions.length
    : 0;

  if (loading) {
    return <div className="text-center py-12 text-slate-300">Loading fraud alerts...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Fraud Detection</h1>
        <p className="text-slate-400 mt-1">Monitor and manage suspicious transactions</p>
      </div>

      {/* Alert Banner */}
      {flaggedTransactions.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🚨</span>
              <div>
                <h2 className="text-xl font-bold text-red-200">
                  {flaggedTransactions.length} Suspicious Transaction{flaggedTransactions.length !== 1 ? 's' : ''}
                </h2>
                <p className="text-sm text-red-300">Requires your attention</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-red-200">${totalBlocked.toFixed(2)}</p>
              <p className="text-sm text-red-300">Total flagged amount</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/40 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🚩</span>
            <h3 className="text-sm font-semibold text-slate-300">Total Flagged</h3>
          </div>
          <p className="text-3xl font-bold text-red-400">{flaggedTransactions.length}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">💰</span>
            <h3 className="text-sm font-semibold text-slate-300">Blocked Amount</h3>
          </div>
          <p className="text-3xl font-bold text-red-400">${totalBlocked.toFixed(2)}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">📊</span>
            <h3 className="text-sm font-semibold text-slate-300">Avg Risk Score</h3>
          </div>
          <p className="text-3xl font-bold text-red-400">{avgRisk.toFixed(1)}%</p>
        </div>
      </div>

      {/* Flagged Transactions List */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Flagged Transactions</h2>
        </div>

        {flaggedTransactions.length > 0 ? (
          <div className="divide-y divide-slate-700">
            {flaggedTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-6 hover:bg-slate-700/50 transition border-l-4 border-red-500"
              >
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">🚨</span>
                      <h3 className="text-lg font-bold text-white">{tx.merchant || 'Unknown Merchant'}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-300">
                      <div>
                        <span className="text-slate-400">Category:</span> {tx.category}
                      </div>
                      <div>
                        <span className="text-slate-400">Amount:</span>{' '}
                        <span className="text-red-400 font-semibold">${tx.amount.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Date:</span>{' '}
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="text-slate-400">Risk Score:</span>{' '}
                        <span className="text-red-400 font-semibold">
                          {(tx.fraudScore || 0).toFixed(0)}%
                        </span>
                      </div>
                      {tx.location && (
                        <div className="md:col-span-2">
                          <span className="text-slate-400">Location:</span> {tx.location}
                        </div>
                      )}
                      {tx.description && (
                        <div className="md:col-span-2">
                          <span className="text-slate-400">Description:</span> {tx.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleMarkLegitimate(tx.id)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition whitespace-nowrap"
                  >
                    ✓ Mark Legitimate
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <span className="text-6xl mb-4 block">✅</span>
            <h3 className="text-xl font-bold text-white mb-2">No Fraud Detected</h3>
            <p className="text-slate-400">All transactions appear legitimate</p>
          </div>
        )}
      </div>
    </div>
  );
}
