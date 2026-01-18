import { useState, useEffect } from 'react';
import { dashboardAPI, transactionAPI, utilityAPI, authAPI } from '../api/client';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seedingData, setSeedingData] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setError('');
    try {
      const [summaryRes, statsRes] = await Promise.all([
        dashboardAPI.getSummary(),
        transactionAPI.getStats(),
      ]);
      setSummary(summaryRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Unable to load dashboard data. Please ensure backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    setSeedingData(true);
    setError('');
    try {
      const res = await utilityAPI.seedDemo();
      alert(`✅ Seeded ${res.data.transactionsCreated} transactions!\n\nDemo Account:\nEmail: demo@example.com\nPassword: Demo@1234`);
      
      // Auto-login demo user
      const loginRes = await authAPI.login('demo@example.com', 'Demo@1234');
      localStorage.setItem('token', loginRes.data.token);
      localStorage.setItem('user', JSON.stringify(loginRes.data.user));
      window.location.reload();
    } catch (err) {
      console.error(err);
      setError('Seeding failed. Ensure backend (port 5000) is running.');
    } finally {
      setSeedingData(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-300 text-lg">Loading dashboard...</div>
      </div>
    );
  }

  const pieData = stats?.spendingByCategory?.map((item) => ({
    name: item.category,
    value: parseFloat(item.total),
  })) || [];

  const lineData = stats?.monthlySpending?.map((item) => ({
    month: new Date(item.month).toLocaleDateString('en-US', { month: 'short' }),
    amount: parseFloat(item.total),
  })) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wider text-emerald-400">Account Balance</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-2">
            ${summary?.balance?.toFixed(2) || '0.00'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">Available funds</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-100 hover:bg-slate-600 transition"
          >
            Refresh
          </button>
          <button
            onClick={handleSeedData}
            disabled={seedingData}
            className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold shadow-lg hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {seedingData ? 'Seeding...' : 'Load Demo Data'}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 text-red-100 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Hero Chart */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Monthly Spending Trends</h2>
          <span className="text-xs text-slate-400">Last 6 months</span>
        </div>
        {lineData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                }}
              />
              <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-slate-400 text-center py-16">
            No spending data yet. Click "Load Demo Data" to preview.
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-4">Spending by Category</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `$${value.toFixed(2)}`}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-slate-400 text-center py-16">No category data yet</div>
          )}
        </div>

        {/* Stats Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
              <span className="text-slate-300">🚨 Fraud Alerts</span>
              <span className="text-red-400 font-bold">{summary?.fraudAlertCount || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
              <span className="text-slate-300">📊 Transactions</span>
              <span className="text-blue-400 font-bold">{summary?.recentTransactions?.length || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
              <span className="text-slate-300">💸 Total Spent</span>
              <span className="text-emerald-400 font-bold">${stats?.totalSpent?.toFixed(2) || '0.00'}</span>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Recent Transactions</h3>
            {summary?.recentTransactions?.length > 0 ? (
              <div className="space-y-2">
                {summary.recentTransactions.map((tx) => (
                  <div key={tx.id} className="p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-sm text-white font-medium">{tx.description || tx.category}</div>
                        <div className="text-xs text-slate-400 mt-1">{tx.merchant}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${tx.type === 'debit' ? 'text-red-400' : 'text-emerald-400'}`}>
                          {tx.type === 'debit' ? '-' : '+'}${tx.amount.toFixed(2)}
                        </div>
                        {tx.isFraudulent && (
                          <span className="text-xs text-red-300">🚨 Flagged</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-400 text-sm text-center py-4">No transactions yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
