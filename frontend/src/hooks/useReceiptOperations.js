/**
 * Custom hook for receipt operations
 * 
 * Handles all receipt-related operations including:
 * - Fetching receipt history
 * - Editing receipts (edit mode, save, cancel)
 * - Deleting receipts with confirmation
 * - Processing receipts into transactions
 * - Managing loading states and error handling
 * - Toast notifications for user feedback
 */
import { useState } from 'react';
import { getReceiptHistory, updateReceipt, deleteReceipt, createTransactionFromReceipt } from '../api/receipts';
import { prepareEditFormData, prepareTransactionData } from '../utils/receiptUtils';
import toast from 'react-hot-toast';

export const useReceiptOperations = () => {
  // State for receipts data and operations
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for editing functionality
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [editForm, setEditForm] = useState({});
  
  // State for processing functionality
  const [processingReceipt, setProcessingReceipt] = useState(null);

  /**
   * Fetches the complete receipt history from the backend
   * Updates receipts state and handles loading/error states
   */
  const fetchReceiptHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getReceiptHistory();
      setReceipts(result.data);
    } catch (err) {
      const errorMessage = err.message;
      setError(errorMessage);
      toast.error(`Failed to fetch receipt history: ${errorMessage}`, {
        duration: 5000,
        icon: '❌',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initiates edit mode for a receipt
   * Prepares edit form with current receipt data
   * @param {object} receipt - Receipt object to edit
   */
  const handleEdit = (receipt) => {
    setEditingReceipt(receipt._id);
    setEditForm(prepareEditFormData(receipt));
    
    toast.success('Edit mode activated', {
      duration: 2000,
      icon: '✏️',
    });
  };

  /**
   * Saves the edited receipt data
   * Updates backend and refreshes receipt list
   * @param {string} receiptId - ID of receipt to save
   */
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
      
      // Refresh the list
      await fetchReceiptHistory();
    } catch (err) {
      toast.error(`Failed to update receipt: ${err.message}`, {
        duration: 5000,
        icon: '❌',
      });
    }
  };

  /**
   * Cancels the current edit operation
   * Resets edit state and shows feedback
   */
  const handleCancel = () => {
    setEditingReceipt(null);
    setEditForm({});
    toast.success('Changes cancelled', {
      duration: 2000,
      icon: '🔄',
    });
  };

  /**
   * Deletes a receipt with user confirmation
   * Updates backend and refreshes receipt list
   * @param {string} receiptId - ID of receipt to delete
   */
  const handleDelete = async (receiptId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this receipt? This action cannot be undone.'
    );

    if (confirmed) {
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
        
        // Refresh the list
        await fetchReceiptHistory();
      } catch (err) {
        toast.error(`Failed to delete receipt: ${err.message}`, {
          duration: 5000,
          icon: '❌',
        });
      }
    }
  };

  /**
   * Processes a receipt into a transaction
   * Creates transaction from receipt data
   * @param {object} receipt - Receipt object to process
   */
  const handleProcessReceipt = async (receipt) => {
    try {
      setProcessingReceipt(receipt._id);
      
      // Show loading toast
      const loadingToast = toast.loading('Processing receipt...', {
        duration: Infinity,
      });

      // Prepare and create transaction
      console.log('Processing receipt:', receipt);
      const transactionData = prepareTransactionData(receipt);
      console.log('Prepared transaction data:', transactionData);
      await createTransactionFromReceipt(transactionData);
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('Receipt processed successfully!', {
        duration: 3000,
        icon: '✅',
      });
      
      // Refresh the list to show updated status
      await fetchReceiptHistory();
      
    } catch (err) {
      // Ensure we have a proper error message
      const errorMessage = err.message || err || 'Unknown error occurred while processing receipt';
      
      // Dismiss loading toast first
      toast.dismiss();
      
      toast.error(`Failed to process receipt: ${errorMessage}`, {
        duration: 5000,
        icon: '❌',
      });
      
      console.error('Receipt processing error:', err);
    } finally {
      setProcessingReceipt(null);
    }
  };

  /**
   * Updates the edit form state
   * @param {object} newFormData - New form data to set
   */
  const updateEditForm = (newFormData) => {
    setEditForm(newFormData);
  };

  // Return all state and handlers for component use
  return {
    // Data state
    receipts,
    loading,
    error,
    
    // Edit state
    editingReceipt,
    editForm,
    updateEditForm,
    
    // Processing state
    processingReceipt,
    
    // Operation handlers
    fetchReceiptHistory,
    handleEdit,
    handleSave,
    handleCancel,
    handleDelete,
    handleProcessReceipt,
  };
};
