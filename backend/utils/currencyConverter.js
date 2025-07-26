// Currency conversion utility for backend
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
const convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (!amount || amount === 0) return 0;
  
  // If same currency, return original amount
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to INR first (base currency), then to target currency
  const inrAmount = amount / exchangeRates[fromCurrency];
  const convertedAmount = inrAmount * exchangeRates[toCurrency];
  
  return convertedAmount;
};

/**
 * Get exchange rate between two currencies
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {number} Exchange rate
 */
const getExchangeRate = (fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return 1;
  return exchangeRates[toCurrency] / exchangeRates[fromCurrency];
};

export { convertCurrency, getExchangeRate, exchangeRates }; 