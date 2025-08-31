/**
 * ScanResults Component
 * 
 * Displays scanned receipt data and provides transaction form:
 * - Shows raw OCR text from scan
 * - Editable transaction form with extracted data
 * - Form validation and error handling
 * - Action buttons for creating transaction or scanning another receipt
 * - Responsive design with theme support
 */
import React from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * Raw text display component
 */
const RawTextDisplay = ({ rawText, isDark }) => (
  <div className="mb-6">
    <h3 className="font-medium mb-2 text-gray-900 dark:text-white">Raw Text:</h3>
    <div className={`p-3 rounded text-sm max-h-32 overflow-y-auto ${
      isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-900'
    }`}>
      {rawText}
    </div>
  </div>
);

/**
 * Form input component
 */
const FormInput = ({ 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false,
  min,
  step,
  isDark 
}) => (
  <div>
    <label className="block text-sm font-medium mb-1">
      {label}{required && <span className="text-red-500 ml-1">*</span>}:
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      step={step}
      required={required}
      className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
        isDark 
          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
          : 'bg-white border-gray-300 text-gray-900'
      }`}
    />
  </div>
);

/**
 * Form select component
 */
const FormSelect = ({ 
  label, 
  name, 
  value, 
  onChange, 
  options, 
  required = false,
  isDark 
}) => (
  <div>
    <label className="block text-sm font-medium mb-1">
      {label}{required && <span className="text-red-500 ml-1">*</span>}:
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
        isDark 
          ? 'bg-gray-700 border-gray-600 text-white' 
          : 'bg-white border-gray-300 text-gray-900'
      }`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

/**
 * Form textarea component
 */
const FormTextarea = ({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder, 
  rows = 3,
  isDark 
}) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}:</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      placeholder={placeholder}
      className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
        isDark 
          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
          : 'bg-white border-gray-300 text-gray-900'
      }`}
    />
  </div>
);

/**
 * Action buttons component
 */
const ActionButtons = ({ 
  onCreateTransaction, 
  onScanAnother, 
  isCreating = false 
}) => (
  <div className="flex gap-4">
    <button
      onClick={onCreateTransaction}
      disabled={isCreating}
      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isCreating ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
          Creating...
        </>
      ) : (
        'Create Transaction'
      )}
    </button>
    <button
      onClick={onScanAnother}
      disabled={isCreating}
      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
    >
      Scan Another Receipt
    </button>
  </div>
);

/**
 * Form validation display component
 */
const ValidationError = ({ error }) => {
  if (!error) return null;

  return (
    <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      <strong>Validation Error:</strong> {error}
    </div>
  );
};

/**
 * Main ScanResults component
 */
const ScanResults = ({ 
  scanResult, 
  transactionData, 
  onInputChange, 
  onCreateTransaction, 
  onScanAnother,
  isCreating = false,
  validationError = null
}) => {
  const { isDark } = useTheme();

  // Transaction type options
  const typeOptions = [
    { value: 'expense', label: 'Expense' },
    { value: 'income', label: 'Income' }
  ];

  if (!scanResult) {
    return null;
  }

  return (
    <div className={`rounded-lg shadow-lg p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Scanned Receipt Data
      </h2>
      
      {/* Raw OCR Text */}
      <RawTextDisplay rawText={scanResult.rawText} isDark={isDark} />

      {/* Validation Error */}
      <ValidationError error={validationError} />

      {/* Transaction Form */}
      <form onSubmit={(e) => { e.preventDefault(); onCreateTransaction(); }}>
        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Merchant */}
          <FormInput
            label="Merchant"
            name="merchant"
            value={transactionData.merchant}
            onChange={onInputChange}
            placeholder="e.g., Walmart, Starbucks"
            required
            isDark={isDark}
          />

          {/* Amount */}
          <FormInput
            label="Amount"
            name="amount"
            type="number"
            value={transactionData.amount}
            onChange={onInputChange}
            placeholder="0.00"
            step="0.01"
            min="0.01"
            required
            isDark={isDark}
          />

          {/* Date */}
          <FormInput
            label="Date"
            name="date"
            type="date"
            value={transactionData.date}
            onChange={onInputChange}
            required
            isDark={isDark}
          />

          {/* Type */}
          <FormSelect
            label="Type"
            name="type"
            value={transactionData.type}
            onChange={onInputChange}
            options={typeOptions}
            required
            isDark={isDark}
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <FormTextarea
            label="Description"
            name="description"
            value={transactionData.description}
            onChange={onInputChange}
            placeholder="Enter transaction description..."
            rows={3}
            isDark={isDark}
          />
        </div>

        {/* Required Fields Note */}
        <div className={`mb-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <span className="text-red-500">*</span> Required fields
        </div>

        {/* Action Buttons */}
        <ActionButtons
          onCreateTransaction={onCreateTransaction}
          onScanAnother={onScanAnother}
          isCreating={isCreating}
        />
      </form>

      {/* Scanning Tips */}
      <div className={`mt-6 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <p className="mb-2">💡 <strong>Tips:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Review the extracted data for accuracy</li>
            <li>The category will be automatically assigned based on merchant</li>
            <li>You can edit any field before creating the transaction</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ScanResults;
