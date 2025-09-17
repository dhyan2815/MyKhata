/**
 * ReceiptCard Component
 * 
 * Displays an individual receipt card with the following features:
 * - Receipt image preview with fallback
 * - Editable receipt details (merchant, amount, description, type)
 * - Status badges and action buttons
 * - Edit/Delete/Process functionality
 * - Responsive design with theme support
 */
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  formatDate,
  getAmountDisplay,
  getMerchantDisplay,
  getTypeDisplay,
  getCategoryDisplay,
  getDescriptionDisplay
} from '../../utils/receiptUtils';

/**
 * Status badge component for receipt status display
 */
const StatusBadge = ({ status, hasTransaction }) => {
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

/**
 * Loading spinner component for process button
 */
const LoadingSpinner = () => (
  <svg className="animate-spin h-4 w-4 mr-2 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

/**
 * Edit/Delete action buttons for receipt image overlay
 */
const ImageActionButtons = ({ receipt, onEdit, onDelete, isDark }) => (
  <div className="absolute top-2 right-2 flex gap-2">
    <button
      onClick={() => onEdit(receipt)}
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
      onClick={() => onDelete(receipt._id)}
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
);

/**
 * Main ReceiptCard component
 */
const ReceiptCard = ({
  receipt,
  isEditing,
  editForm,
  onEditFormChange,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onProcess,
  isProcessing
}) => {
  const { isDark } = useTheme();

  return (
    <div
      className={`rounded-lg shadow-lg overflow-hidden ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
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
          
          <ImageActionButtons 
            receipt={receipt}
            onEdit={onEdit}
            onDelete={onDelete}
            isDark={isDark}
          />
        </div>
      )}

      {/* Receipt Details */}
      <div className="p-4">
        {/* Header with Merchant and Status */}
        <div className="flex justify-between items-start mb-3">
          <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {isEditing ? (
              <input
                type="text"
                value={editForm.merchant}
                onChange={(e) => onEditFormChange({...editForm, merchant: e.target.value})}
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
            <StatusBadge status={receipt.status} hasTransaction={!!receipt.transactionId} />
            {isEditing ? (
              <select
                value={editForm.type}
                onChange={(e) => onEditFormChange({...editForm, type: e.target.value})}
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
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  getTypeDisplay(receipt) === 'income'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {getTypeDisplay(receipt) === 'income' ? 'Income' : 'Expense'}
              </span>
            )}
          </div>
        </div>

        {/* Amount and Category */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Amount:
            </span>
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {isEditing ? (
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editForm.amount}
                  onChange={(e) => onEditFormChange({...editForm, amount: e.target.value})}
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
            <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Category:
            </span>
            <span className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
              {getCategoryDisplay(receipt)}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <div className="flex justify-between items-start">
            <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Description:
            </span>
            <span className={`line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {isEditing ? (
                <textarea
                  value={editForm.description}
                  onChange={(e) => onEditFormChange({...editForm, description: e.target.value})}
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

        {/* Receipt Status and Date */}
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Scanned: {formatDate(receipt.createdAt)}</span>
          {!receipt.transactionId && (
            <span className="text-blue-600">Ready to Process</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={() => onSave(receipt._id)}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={onCancel}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              {!receipt.transactionId ? (
                <button
                  onClick={() => onProcess(receipt)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <LoadingSpinner />
                      Processing...
                    </>
                  ) : (
                    'Process Receipt'
                  )}
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
  );
};

export default ReceiptCard;
