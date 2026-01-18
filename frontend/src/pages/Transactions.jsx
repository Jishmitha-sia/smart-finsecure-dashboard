import { useState, useEffect } from 'react';
import { transactionAPI } from '../api/client';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    amount: '',
    category: 'Groceries',
    type: 'debit',
    description: '',
    merchant: '',
    location: '',
  });

  useEffect(() => {
    fetchTransactions();
  }, [page]);

  const fetchTransactions = async () => {
    try {
      const response = await transactionAPI.getAll(page, 10);
      setTransactions(response.data.transactions || response.data);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTransaction) {
        await transactionAPI.update(editingTransaction.id, formData);
      } else {
        await transactionAPI.create(formData);
      }
      setShowModal(false);
      resetForm();
      fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save transaction');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return;
    try {
      await transactionAPI.delete(id);
      fetchTransactions();
    } catch (err) {
      setError('Failed to delete transaction');
    }
  };

  const handleEdit = (tx) => {
    setEditingTransaction(tx);
    setFormData({
      amount: tx.amount,
      category: tx.category,
      type: tx.type,
      description: tx.description || '',
      merchant: tx.merchant || '',
      location: tx.location || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      category: 'Groceries',
      type: 'debit',
      description: '',
      merchant: '',
      location: '',
    });
    setEditingTransaction(null);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-300">Loading transactions...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Transactions</h1>
          <p className="text-slate-400 mt-1">Manage your financial transactions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
        >
          + Add Transaction
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/40 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Merchant</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className={`hover:bg-slate-700/50 transition ${
                      tx.isFraudulent ? 'border-l-4 border-red-500' : ''
                    }`}
                  >
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-white">{tx.merchant || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{tx.category}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-semibold ${tx.type === 'debit' ? 'text-red-400' : 'text-emerald-400'}`}>
                        {tx.type === 'debit' ? '-' : '+'}${tx.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {tx.isFraudulent ? (
                        <span className="px-3 py-1 text-xs font-semibold bg-red-500/20 text-red-300 rounded-full">
                          ⚠️ Fraud
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-semibold bg-green-500/20 text-green-300 rounded-full">
                          ✅ Safe
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <button
                        onClick={() => handleEdit(tx)}
                        className="text-blue-400 hover:text-blue-300 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    No transactions found. Click "Add Transaction" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-slate-900 px-6 py-4 flex justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-slate-300">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white text-2xl">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    💵 Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    💸 Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="debit">Expense</option>
                    <option value="credit">Income</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    📂 Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Groceries">🛒 Groceries</option>
                    <option value="Transport">🚗 Transport</option>
                    <option value="Shopping">🛍️ Shopping</option>
                    <option value="Entertainment">🎬 Entertainment</option>
                    <option value="Dining">🍽️ Dining</option>
                    <option value="Utilities">💡 Utilities</option>
                    <option value="Healthcare">🏥 Healthcare</option>
                    <option value="Other">📌 Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    🏪 Merchant
                  </label>
                  <input
                    type="text"
                    value={formData.merchant}
                    onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    📝 Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    📍 Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                >
                  {editingTransaction ? 'Update' : 'Add'} Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
