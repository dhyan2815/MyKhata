// /pages/ReceiptHistory.jsx
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
      minute: '2-digit',
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getStatusBadge = (status, hasTransaction) => {
    if (hasTransaction) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Processed
        </span>
      );
    }

    switch (status) {
      case 'scanned':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Scanned
          </span>
        );
      case 'failed':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Failed
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Pending
          </span>
        );
    }
  };

  const getAmountDisplay = (receipt) => {
    if (receipt.transactionId) {
      return formatAmount(receipt.transactionId.amount);
    }
    const amount =
      receipt.extractedData?.amount ||
      receipt.extractedData?.total ||
      receipt.extractedData?.subtotal;
    return formatAmount(amount);
  };

  const getMerchantDisplay = (receipt) => {
    if (receipt.transactionId) {
      return receipt.transactionId.merchant;
    }
    return receipt.extractedData?.merchant || 'Not detected';
  };

  const getTypeDisplay = (receipt) => {
    if (receipt.transactionId) {
      return receipt.transactionId.type;
    }
    return receipt.extractedData?.type || 'expense';
  };

  const getCategoryDisplay = (receipt) => {
    if (receipt.transactionId?.category?.name) {
      return receipt.transactionId.category.name;
    }
    return 'Not detected';
  };

  const getDescriptionDisplay = (receipt) => {
    if (receipt.transactionId) {
      return receipt.transactionId.description;
    }
    return receipt.extractedData?.description || 'No description';
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
          }`}
      >
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
      <div
        className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
          }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
        }`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between mb-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Receipt History
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 mb-3">
              View and manage all your scanned receipts
            </p>
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Total Receipts Scanned: <strong>{receipts.length}</strong>
          </div>
        </div>

        {receipts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              No Receipts Yet
            </h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Start scanning receipts to see them appear here
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {receipts.map((receipt) => (
              <div
                key={receipt._id}
                className={`rounded-lg shadow-lg overflow-hidden ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
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
                    <div className="hidden items-center justify-center text-white dark:text-gray-900">
                      <span>📄 Receipt Image</span>
                    </div>
                  </div>
                )}

                {/* Receipt Details */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3
                      className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'
                        }`}
                    >
                      {getMerchantDisplay(receipt)}
                    </h3>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(receipt.status, !!receipt.transactionId)}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeDisplay(receipt) === 'income'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {getTypeDisplay(receipt) === 'income'
                          ? 'Income'
                          : 'Expense'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span
                        className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                      >
                        Amount:
                      </span>
                      <span
                        className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'
                          }`}
                      >
                        {getAmountDisplay(receipt)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span
                        className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                      >
                        Category:
                      </span>
                      <span className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {getCategoryDisplay(receipt)}
                      </span>
                    </div>

                  </div>

                  <div className="mb-4 flex justify-between">
                  <span
                        className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                      >
                        Description:
                      </span>
                    <span
                      className={`line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'
                        }`}
                    >
                      {getDescriptionDisplay(receipt)}
                    </span>
                  </div>

                  {/* Receipt Status and Actions */}
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Scanned: {formatDate(receipt.createdAt)}</span>
                    {!receipt.transactionId && (
                      <span className="text-blue-600">Ready to Process</span>
                    )}
                  </div>

                  {/* Action Buttons for Unprocessed Receipts */}
                  {!receipt.transactionId && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => {
                          alert(
                            'Navigate to ReceiptScanner to process this receipt'
                          );
                        }}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                      >
                        Process Receipt
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Summary Stats */}
        {receipts.length > 0 && (
          <div
            className={`mt-12 rounded-lg p-6 shadow-lg border ${isDark
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
              }`}
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Receipt Summary</h2>
            <div className="flex flex-wrap justify-center lg:justify-between items-center gap-4 px-2">
              <div className="flex flex-col items-center min-w-[120px] p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="text-4xl font-bold text-blue-600">
                  {receipts.length}
                </div>
                <div
                  className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  Total Scanned
                </div>
              </div>
              <div className="flex flex-col items-center min-w-[120px] p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="text-4xl font-bold text-green-600">
                  {receipts.filter((r) => r.transactionId).length}
                </div>
                <div
                  className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  Processed
                </div>
              </div>
              <div className="flex flex-col items-center min-w-[120px] p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="text-4xl font-bold text-yellow-600">
                  {receipts.filter((r) => !r.transactionId).length}
                </div>
                <div
                  className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  Pending
                </div>
              </div>
              <div className="flex flex-col items-center min-w-[120px] p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="text-4xl font-bold text-purple-600">
                  {formatAmount(
                    receipts
                      .filter((r) => r.transactionId)
                      .reduce((sum, r) => sum + (r.transactionId.amount || 0), 0)
                  )}
                </div>
                <div
                  className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  Total Value
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptHistory;
