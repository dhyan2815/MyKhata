// /pages/ReceiptHistory.jsx
import React, { useState, useEffect } from 'react';
import { getReceiptHistory, updateReceipt, deleteReceipt } from '../api/receipts';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const ReceiptHistory = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [editForm, setEditForm] = useState({});
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
      toast.error(`Failed to fetch receipt history: ${err.message}`, {
        duration: 5000,
        icon: '❌',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (receipt) => {
    setEditingReceipt(receipt._id);
    setEditForm({
      merchant: receipt.extractedData?.merchant || receipt.transactionId?.merchant || '',
      amount: receipt.extractedData?.amount || receipt.extractedData?.total || receipt.extractedData?.subtotal || receipt.transactionId?.amount || '',
      description: receipt.extractedData?.description || receipt.transactionId?.description || '',
      type: receipt.extractedData?.type || receipt.transactionId?.type || 'expense'
    });
    
    toast.success('Edit mode activated', {
      duration: 2000,
      icon: '✏️',
    });
  };

  const handleSave = async (receiptId) => {
    try {
      // Show loading toast
      const loadingToast = toast.loading('Saving changes...', {
        duration: Infinity,
      });
      
      await updateReceipt(receiptId, editForm);
      setEditingReceipt(null);
      setEditForm({});
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('Receipt updated successfully!', {
        duration: 3000,
        icon: '✅',
      });
      
      fetchReceiptHistory(); // Refresh the list
    } catch (err) {
      toast.error(`Failed to update receipt: ${err.message}`, {
        duration: 5000,
        icon: '❌',
      });
    }
  };

  const handleCancel = () => {
    setEditingReceipt(null);
    setEditForm({});
    toast.success('Changes cancelled', {
      duration: 2000,
      icon: '🔄',
    });
  };

  const handleDelete = async (receiptId) => {
    if (window.confirm('Are you sure you want to delete this receipt? This action cannot be undone.')) {
      try {
        // Show loading toast
        const loadingToast = toast.loading('Deleting receipt...', {
          duration: Infinity,
        });
        
        await deleteReceipt(receiptId);
        
        // Dismiss loading toast and show success
        toast.dismiss(loadingToast);
        toast.success('Receipt deleted successfully!', {
          duration: 3000,
          icon: '🗑️',
        });
        
        fetchReceiptHistory(); // Refresh the list
      } catch (err) {
        toast.error(`Failed to delete receipt: ${err.message}`, {
          duration: 5000,
          icon: '❌',
        });
      }
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
    if (receipt.transactionId?.category) {
      // If category is populated with full object
      if (typeof receipt.transactionId.category === 'object' && receipt.transactionId.category.name) {
        return receipt.transactionId.category.name;
      }
      // If category is just an ID, show a placeholder
      return 'Category Assigned';
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
                  <div className="h-48 bg-gray-100 flex items-center justify-center relative">
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
                    
                    {/* Edit and Delete Icons - Positioned at top-right of image */}
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={() => handleEdit(receipt)}
                        className={`p-2 rounded-full shadow-lg transition-all hover:scale-110 ${
                          isDark 
                            ? 'bg-gray-800 text-blue-400 hover:bg-gray-700' 
                            : 'bg-white text-blue-600 hover:bg-blue-50'
                        }`}
                        title="Edit Receipt"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(receipt._id)}
                        className={`p-2 rounded-full shadow-lg transition-all hover:scale-110 ${
                          isDark 
                            ? 'bg-gray-800 text-red-400 hover:bg-gray-700' 
                            : 'bg-white text-red-600 hover:bg-red-50'
                        }`}
                        title="Delete Receipt"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
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
                      {editingReceipt === receipt._id ? (
                        <input
                          type="text"
                          value={editForm.merchant}
                          onChange={(e) => setEditForm({...editForm, merchant: e.target.value})}
                          className={`w-full px-2 py-1 rounded border ${
                            isDark 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      ) : (
                        getMerchantDisplay(receipt)
                      )}
                    </h3>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(receipt.status, !!receipt.transactionId)}
                      {editingReceipt === receipt._id ? (
                        <select
                          value={editForm.type}
                          onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                          className={`px-2 py-1 rounded border text-xs font-medium ${
                            isDark 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="expense">Expense</option>
                          <option value="income">Income</option>
                        </select>
                      ) : (
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
                      )}
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
                        {editingReceipt === receipt._id ? (
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editForm.amount}
                            onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                            className={`w-24 px-2 py-1 rounded border text-right ${
                              isDark 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        ) : (
                          getAmountDisplay(receipt)
                        )}
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

                  <div className="mb-4">
                    <div className="flex justify-between items-start">
                      <span
                        className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                      >
                        Description:
                      </span>
                      <span
                        className={`line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'
                          }`}
                      >
                        {editingReceipt === receipt._id ? (
                          <textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                            rows="2"
                            className={`w-32 px-2 py-1 rounded border text-sm ${
                              isDark 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        ) : (
                          getDescriptionDisplay(receipt)
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Receipt Status and Actions */}
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Scanned: {formatDate(receipt.createdAt)}</span>
                    {!receipt.transactionId && (
                      <span className="text-blue-600">Ready to Process</span>
                    )}
                  </div>

                  {/* Action Buttons for Receipts */}
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    {editingReceipt === receipt._id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(receipt._id)}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        {!receipt.transactionId ? (
                          <button
                            onClick={() => {
                              toast.info('Navigate to ReceiptScanner to process this receipt', {
                                duration: 4000,
                                icon: 'ℹ️',
                              });
                            }}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                          >
                            Process Receipt
                          </button>
                        ) : (
                          <div className="w-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-2 rounded text-sm font-medium text-center">
                            Receipt Processed
                          </div>
                        )}
                      </>
                    )}
                  </div>
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
