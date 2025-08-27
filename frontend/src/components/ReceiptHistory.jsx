import React, { useState, useEffect } from 'react';
import { getReceiptHistory } from '../api/receipts';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ReceiptHistory = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { isDark } = useTheme();

  useEffect(() => {
    fetchReceiptHistory();
  }, []);

  const fetchReceiptHistory = async () => {
    try {
      setLoading(true);
      const result = await getReceiptHistory();
      setReceipts(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg">Loading receipt history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Receipt History</h1>
          <div className="text-sm text-gray-500">
            Total Scanned: {receipts.length}
          </div>
        </div>

        {receipts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold mb-2">No Receipts Yet</h3>
            <p className="text-gray-500">
              Start scanning receipts to see them appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {receipts.map((receipt) => (
              <div
                key={receipt._id}
                className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                  isDark ? 'border border-gray-700' : ''
                }`}
              >
                {/* Receipt Image Preview */}
                {receipt.receiptImage && (
                  <div className="h-48 bg-gray-100 flex items-center justify-center">
                    <img
                      src={receipt.receiptImage}
                      alt="Receipt"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden items-center justify-center text-gray-500">
                      <span>📄 Receipt Image</span>
                    </div>
                  </div>
                )}

                {/* Receipt Details */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {receipt.merchant || 'Unknown Merchant'}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        receipt.type === 'income'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {receipt.type === 'income' ? '💰 Income' : '💸 Expense'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-semibold text-gray-900">
                        {formatAmount(receipt.amount)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="text-gray-900">
                        {receipt.category?.name || receipt.category || 'Uncategorized'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="text-gray-900">
                        {formatDate(receipt.date)}
                      </span>
                    </div>
                  </div>

                  {receipt.description && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {receipt.description}
                      </p>
                    </div>
                  )}

                  {/* Transaction Status */}
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Created: {formatDate(receipt.createdAt)}</span>
                    <span className="text-green-600">✓ Processed</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {receipts.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {receipts.length}
                </div>
                <div className="text-sm text-gray-600">Total Receipts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatAmount(
                    receipts
                      .filter(r => r.type === 'income')
                      .reduce((sum, r) => sum + r.amount, 0)
                  )}
                </div>
                <div className="text-sm text-gray-600">Total Income</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {formatAmount(
                    receipts
                      .filter(r => r.type === 'expense')
                      .reduce((sum, r) => sum + r.amount, 0)
                  )}
                </div>
                <div className="text-sm text-gray-600">Total Expenses</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptHistory;
