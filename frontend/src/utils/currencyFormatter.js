// Currency formatting utility with conversion functionality
// Maps currency codes to their symbols and formatting options
const currencyConfig = {
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  GBP: { symbol: '£', name: 'British Pound' },
  JPY: { symbol: '¥', name: 'Japanese Yen' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar' },
  AUD: { symbol: 'A$', name: 'Australian Dollar' },
  INR: { symbol: '₹', name: 'Indian Rupee' },
  CNY: { symbol: '¥', name: 'Chinese Yuan' },
};

// Exchange rates (base currency: INR)
// These are approximate rates - in a real app, you'd fetch these from an API
const exchangeRates = {
  USD: 0.012, // 1 INR = 0.012 USD
  EUR: 0.011, // 1 INR = 0.011 EUR
  GBP: 0.0095, // 1 INR = 0.0095 GBP
  JPY: 1.8, // 1 INR = 1.8 JPY
  CAD: 0.016, // 1 INR = 0.016 CAD
  AUD: 0.018, // 1 INR = 0.018 AUD
  INR: 1, // 1 INR = 1 INR (base currency)
  CNY: 0.087, // 1 INR = 0.087 CNY
};

/**
 * Convert amount from one currency to another
 * @param {number} amount - The amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {number} Converted amount
 */
export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (!amount || amount === 0) return 0;
  
  // If same currency, return original amount
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to INR first (base currency), then to target currency
  const inrAmount = amount / exchangeRates[fromCurrency];
  const convertedAmount = inrAmount * exchangeRates[toCurrency];
  
  return convertedAmount;
};

/**
 * Format amount with the specified currency
 * @param {number} amount - The amount to format
 * @param {string} currencyCode - The currency code (e.g., 'USD', 'INR')
 * @param {object} options - Additional formatting options
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currencyCode = 'INR', options = {}) => {
  const currency = currencyConfig[currencyCode] || currencyConfig.INR;
  const { 
    showSymbol = true, 
    showCode = false, 
    decimals = 2,
    position = 'before', // 'before' or 'after'
    fromCurrency = 'INR' // Source currency for conversion
  } = options;

  // Handle null/undefined amounts
  if (amount === null || amount === undefined) {
    amount = 0;
  }

  // Convert amount if fromCurrency is different from currencyCode
  let displayAmount = amount;
  if (fromCurrency !== currencyCode) {
    displayAmount = convertCurrency(amount, fromCurrency, currencyCode);
  }

  // Format the number with appropriate decimals
  const formattedAmount = Number(displayAmount).toFixed(decimals);

  // Build the formatted string
  let result = formattedAmount;
  
  if (showSymbol) {
    if (position === 'before') {
      result = `${currency.symbol}${result}`;
    } else {
      result = `${result}${currency.symbol}`;
    }
  }
  
  if (showCode) {
    result = `${result} ${currencyCode}`;
  }

  return result;
};

/**
 * Format amount with sign for transactions (income/expense)
 * @param {number} amount - The amount to format
 * @param {string} type - Transaction type ('income' or 'expense')
 * @param {string} currencyCode - The currency code
 * @param {object} options - Additional formatting options
 * @returns {string} Formatted currency string with sign
 */
export const formatTransactionAmount = (amount, type, currencyCode = 'INR', options = {}) => {
  const sign = type === 'expense' ? '-' : '+';
  const formattedAmount = formatCurrency(Math.abs(amount), currencyCode, options);
  return `${sign}${formattedAmount}`;
};

/**
 * Get currency symbol for a given currency code
 * @param {string} currencyCode - The currency code
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currencyCode = 'INR') => {
  const currency = currencyConfig[currencyCode] || currencyConfig.INR;
  return currency.symbol;
};

/**
 * Get currency name for a given currency code
 * @param {string} currencyCode - The currency code
 * @returns {string} Currency name
 */
export const getCurrencyName = (currencyCode = 'INR') => {
  const currency = currencyConfig[currencyCode] || currencyConfig.INR;
  return currency.name;
};

/**
 * Get exchange rate between two currencies
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {number} Exchange rate
 */
export const getExchangeRate = (fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return 1;
  return exchangeRates[toCurrency] / exchangeRates[fromCurrency];
};

export default {
  formatCurrency,
  formatTransactionAmount,
  getCurrencySymbol,
  getCurrencyName,
  convertCurrency,
  getExchangeRate,
  currencyConfig,
  exchangeRates
}; 