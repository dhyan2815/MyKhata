/**
 * Utility functions for receipt data processing and formatting
 * Extracted from ReceiptHistory component for better maintainability
 */

/**
 * Formats a date string to a readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Formats an amount to Indian currency format
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatAmount = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

/**
 * Gets the display amount from receipt data
 * @param {object} receipt - Receipt object
 * @returns {string} Formatted amount display
 */
export const getAmountDisplay = (receipt) => {
  if (receipt.transactionId) {
    return formatAmount(receipt.transactionId.amount);
  }
  const amount =
    receipt.extractedData?.amount ||
    receipt.extractedData?.total ||
    receipt.extractedData?.subtotal;
  return formatAmount(amount);
};

/**
 * Gets the merchant name from receipt data
 * @param {object} receipt - Receipt object
 * @returns {string} Merchant name or fallback text
 */
export const getMerchantDisplay = (receipt) => {
  if (receipt.transactionId) {
    return receipt.transactionId.merchant;
  }
  return receipt.extractedData?.merchant || 'Not detected';
};

/**
 * Gets the transaction type from receipt data
 * @param {object} receipt - Receipt object
 * @returns {string} Transaction type (income/expense)
 */
export const getTypeDisplay = (receipt) => {
  if (receipt.transactionId) {
    return receipt.transactionId.type;
  }
  return receipt.extractedData?.type || 'expense';
};

/**
 * Gets the category name from receipt data
 * @param {object} receipt - Receipt object
 * @returns {string} Category name or fallback text
 */
export const getCategoryDisplay = (receipt) => {
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

/**
 * Gets the description from receipt data
 * @param {object} receipt - Receipt object
 * @returns {string} Description or fallback text
 */
export const getDescriptionDisplay = (receipt) => {
  if (receipt.transactionId) {
    return receipt.transactionId.description;
  }
  return receipt.extractedData?.description || 'No description';
};

/**
 * Prepares edit form data from receipt object
 * @param {object} receipt - Receipt object
 * @returns {object} Edit form data
 */
export const prepareEditFormData = (receipt) => {
  return {
    merchant: receipt.extractedData?.merchant || receipt.transactionId?.merchant || '',
    amount: receipt.extractedData?.amount || receipt.extractedData?.total || receipt.extractedData?.subtotal || receipt.transactionId?.amount || '',
    description: receipt.extractedData?.description || receipt.transactionId?.description || '',
    type: receipt.extractedData?.type || receipt.transactionId?.type || 'expense'
  };
};

/**
 * Prepares transaction data from receipt for processing
 * @param {object} receipt - Receipt object
 * @returns {object} Transaction data for API call
 */
export const prepareTransactionData = (receipt) => {
  // Get merchant with fallback
  const merchant = receipt.extractedData?.merchant || 'Unknown Merchant';
  
  // Get amount with validation
  const amount = receipt.extractedData?.amount || 
                receipt.extractedData?.total || 
                receipt.extractedData?.subtotal;
  
  // Ensure amount is a valid number
  const validAmount = amount && !isNaN(parseFloat(amount)) ? parseFloat(amount) : 0;
  
  // Validate required fields
  if (!merchant || merchant === 'Unknown Merchant' || merchant.trim() === '') {
    throw new Error('Merchant information was not detected from receipt. Please edit the receipt to add merchant details before processing.');
  }
  
  if (!validAmount || validAmount <= 0) {
    throw new Error('Amount was not detected from receipt. Please edit the receipt to add a valid amount before processing.');
  }
  
  return {
    merchant: merchant,
    amount: validAmount,
    description: receipt.extractedData?.description || `Receipt from ${merchant}`,
    type: receipt.extractedData?.type || 'expense',
    date: receipt.extractedData?.date || receipt.createdAt,
    receiptId: receipt._id
  };
};

/**
 * Calculates total processed amount from receipts array
 * @param {array} receipts - Array of receipt objects
 * @returns {number} Total processed amount
 */
export const calculateTotalProcessedAmount = (receipts) => {
  return receipts
    .filter((r) => r.transactionId) // Only processed receipts
    .reduce((sum, r) => {
      // Use transactionId.amount if available, otherwise fall back to extractedData
      const amount = r.transactionId?.amount || 
                   r.extractedData?.amount || 
                   r.extractedData?.total || 
                   r.extractedData?.subtotal || 0;
      return sum + amount;
    }, 0);
};

/**
 * Gets receipt statistics for overview display
 * @param {array} receipts - Array of receipt objects
 * @returns {object} Statistics object with counts and totals
 */
export const getReceiptStatistics = (receipts) => {
  const totalScanned = receipts.length;
  const totalProcessed = receipts.filter((r) => r.transactionId).length;
  const totalPending = receipts.filter((r) => !r.transactionId).length;
  const totalAmount = calculateTotalProcessedAmount(receipts);

  return {
    totalScanned,
    totalProcessed,
    totalPending,
    totalAmount,
    formattedAmount: formatAmount(totalAmount)
  };
};
