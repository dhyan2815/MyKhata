/**
 * ReceiptHistory Component
 * 
 * Main component for displaying receipt history with comprehensive features:
 * - View all receipts in a responsive grid layout
 * - Edit, delete, and process receipts
 * - Display overview statistics
 * - Handle loading and error states
 * - Dark/light theme support
 * 
 * This component has been refactored into smaller, maintainable pieces:
 * - ReceiptCard: Individual receipt display and actions
 * - ReceiptOverview: Statistics and overview display
 * - useReceiptOperations: Custom hook for all receipt operations
 * - receiptUtils: Utility functions for data processing
 */
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useReceiptOperations } from '../../hooks/useReceiptOperations';
import ReceiptCard from './ReceiptCard';
import ReceiptOverview from './ReceiptOverview';
import { CheckSquare, Square, Trash2, X } from 'lucide-react';

const ReceiptHistory = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  
  // Multi-select state
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedReceipts, setSelectedReceipts] = useState(new Set());
  
  // Use custom hook for all receipt operations
  const {
    receipts,
    loading,
    error,
    editingReceipt,
    editForm,
    updateEditForm,
    processingReceipt,
    fetchReceiptHistory,
    handleEdit,
    handleSave,
    handleCancel,
    handleDelete,
    handleProcessReceipt,
  } = useReceiptOperations();

  // Fetch receipt history on component mount
  useEffect(() => {
    fetchReceiptHistory();
  }, []);

  // Multi-select handlers
  const toggleMultiSelectMode = () => {
    setIsMultiSelectMode(!isMultiSelectMode);
    setSelectedReceipts(new Set());
  };

  const toggleReceiptSelection = (receiptId) => {
    const newSelected = new Set(selectedReceipts);
    if (newSelected.has(receiptId)) {
      newSelected.delete(receiptId);
    } else {
      newSelected.add(receiptId);
    }
    setSelectedReceipts(newSelected);
  };

  const selectAllReceipts = () => {
    setSelectedReceipts(new Set(receipts.map(receipt => receipt._id)));
  };

  const clearSelection = () => {
    setSelectedReceipts(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedReceipts.size === 0) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedReceipts.size} receipt(s)? This action cannot be undone.`
    );

    if (confirmed) {
      try {
        // Delete all selected receipts
        const deletePromises = Array.from(selectedReceipts).map(receiptId => 
          handleDelete(receiptId)
        );
        await Promise.all(deletePromises);
        
        // Clear selection and exit multi-select mode
        setSelectedReceipts(new Set());
        setIsMultiSelectMode(false);
      } catch (error) {
        console.error('Bulk delete error:', error);
      }
    }
  };


  // Loading state component
  const LoadingState = () => (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading receipt history...</p>
        </div>
      </div>
    </div>
  );

  // Error state component
  const ErrorState = () => (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      </div>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📄</div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
        No Receipts Yet
      </h3>
      <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        Start scanning receipts to see them appear here
      </p>
    </div>
  );

  // Render loading state
  if (loading) {
    return <LoadingState />;
  }

  // Render error state
  if (error) {
    return <ErrorState />;
  }

  // Main render - simplified with extracted components
  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Helmet>
        <title>Receipt History · MyKhata</title>
        <meta name="description" content="View and manage all your scanned receipts with MyKhata's receipt history dashboard" />
      </Helmet>
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex justify-between mb-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Receipt History
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 mb-3">
              View and manage all your scanned receipts
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Total Receipts Scanned: <strong>{receipts.length}</strong>
            </div>
            {!isMultiSelectMode ? (
              <button
                onClick={toggleMultiSelectMode}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
              >
                <CheckSquare size={16} />
                Multi-Select
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedReceipts.size} selected
                </span>
                <button
                  onClick={selectAllReceipts}
                  className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={clearSelection}
                  className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={selectedReceipts.size === 0}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded transition-colors"
                >
                  <Trash2 size={14} />
                  Delete ({selectedReceipts.size})
                </button>
                <button
                  onClick={toggleMultiSelectMode}
                  className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Receipt Content */}
        {receipts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {receipts.map((receipt) => (
              <ReceiptCard
                key={receipt._id}
                receipt={receipt}
                isEditing={editingReceipt === receipt._id}
                editForm={editForm}
                onEditFormChange={updateEditForm}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancel={handleCancel}
                onDelete={handleDelete}
                onProcess={handleProcessReceipt}
                isProcessing={processingReceipt === receipt._id}
                isMultiSelectMode={isMultiSelectMode}
                isSelected={selectedReceipts.has(receipt._id)}
                onToggleSelection={toggleReceiptSelection}
              />
            ))}
          </div>
        )}

        {/* Overview Statistics */}
        <ReceiptOverview receipts={receipts} />
      </div>
    </div>
  );
};

export default ReceiptHistory;
