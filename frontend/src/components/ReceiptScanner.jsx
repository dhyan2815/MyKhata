import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useDropzone } from 'react-dropzone';
import { scanReceipt, createTransactionFromReceipt } from '../api/receipts';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const ReceiptScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upload'); // 'camera' or 'upload'
  const [receiptId, setReceiptId] = useState(null); // Store receipt ID from scan
  const [transactionData, setTransactionData] = useState({
    merchant: '',
    amount: '',
    date: '',
    category: 'Uncategorized',
    description: '',
    type: 'expense'
  });
  
  const webcamRef = useRef(null);
  const { user } = useAuth();
  const { isDark } = useTheme();

  // Camera capture function
  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        // Convert base64 to blob
        fetch(imageSrc)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], 'receipt.jpg', { type: 'image/jpeg' });
            processReceipt(file);
          });
      }
    }
  }, []);

  // File drop handling
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      processReceipt(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    multiple: false
  });

  // Process receipt image
  const processReceipt = async (imageFile) => {
    setIsScanning(true);
    setError(null);
    
    // Show loading toast
    const loadingToast = toast.loading('Scanning receipt...', {
      duration: Infinity,
    });
    
    try {
      const result = await scanReceipt(imageFile);
      setScanResult(result.data);
      setReceiptId(result.data.receiptId); // Store receipt ID
      
      // Pre-fill transaction data with scanned values or 'Unspecified' if missing
      setTransactionData(prev => ({
        ...prev,
        merchant: result.data.merchant || 'Unspecified',
        amount: result.data.total || result.data.subtotal || result.data.amount || '',
        date: result.data.date || new Date().toISOString().split('T')[0],
        description: result.data.description || `Receipt from ${result.data.merchant || 'Unspecified'}`,
        type: result.data.type || 'expense'
      }));
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('Receipt scanned successfully!', {
        duration: 3000,
        icon: '📄',
      });
      
    } catch (err) {
      setError(err.message);
      setScanResult(null);
      
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast);
      toast.error(`Failed to scan receipt: ${err.message}`, {
        duration: 5000,
        icon: '❌',
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Create transaction from scanned data
  const handleCreateTransaction = async () => {
    try {
      // Validate required fields before sending
      if (!transactionData.amount || !transactionData.merchant) {
        toast.error('Amount and merchant are required fields', {
          duration: 4000,
          icon: '⚠️',
        });
        return;
      }

      // Ensure amount is a valid number
      const amount = parseFloat(transactionData.amount);
      if (isNaN(amount) || amount <= 0) {
        toast.error('Please enter a valid amount', {
          duration: 4000,
          icon: '⚠️',
        });
        return;
      }

      // Prepare data for backend (remove category as backend will handle it)
      const transactionPayload = {
        merchant: transactionData.merchant,
        amount: amount,
        date: transactionData.date,
        description: transactionData.description,
        type: transactionData.type,
        receiptId: receiptId // Include receiptId
      };

      console.log('Creating transaction with data:', transactionPayload);
      
      // Show loading toast
      const loadingToast = toast.loading('Creating transaction...', {
        duration: Infinity,
      });
      
      const result = await createTransactionFromReceipt(transactionPayload);
      console.log('Transaction created successfully:', result);
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('Transaction created successfully!', {
        duration: 4000,
        icon: '✅',
      });
      
      // Reset form and state after successful creation
      setTransactionData({
        merchant: '',
        amount: '',
        date: '',
        category: 'Uncategorized',
        description: '',
        type: 'expense'
      });
      setScanResult(null);
      setError(null);
      setReceiptId(null); // Clear receiptId after successful creation
      
    } catch (err) {
      console.error('Transaction creation failed:', err);
      setError(err.message || 'Failed to create transaction');
      
      toast.error(`Failed to create transaction: ${err.message}`, {
        duration: 5000,
        icon: '❌',
      });
    }
  };

  // Update transaction data
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTransactionData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Receipt Scanner</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 mb-8">Scan receipts to create transactions seamlessly</p>
        
        {/* Tab Navigation */}
        <div className="flex mb-6 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('camera')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'camera'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Camera
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'upload'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Upload File
          </button>
        </div>

        {/* Camera Tab */}
        {activeTab === 'camera' && (
          <div className="mb-8">
            <div className={`rounded-lg shadow-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Take Photo of Receipt</h2>
              <div className="flex justify-center mb-4">
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="rounded-lg max-w-full"
                  width={400}
                  height={300}
                />
              </div>
              <div className="flex justify-center">
                <button
                  onClick={capturePhoto}
                  disabled={isScanning}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
                >
                  {isScanning ? 'Processing...' : 'Capture Photo 📸'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="mb-8">
            <div className={`rounded-lg shadow-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Upload Receipt Image</h2>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : isDark 
                      ? 'border-gray-600 hover:border-gray-500 bg-gray-700'
                      : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <div className="text-4xl mb-4">📄</div>
                {isDragActive ? (
                  <p className="text-blue-600">Drop the receipt image here...</p>
                ) : (
                  <div>
                    <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Click here to choose a file or drag and drop a receipt here
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      JPG, JPEG & PNG formats are supported
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isScanning && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg">Scanning receipt...</p>
            <p className="text-sm text-gray-500">This may take a few seconds</p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Scan Results */}
        {scanResult && (
          <div className={`rounded-lg shadow-lg p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Scanned Receipt Data</h2>
            
            {/* Raw OCR Text */}
            <div className="mb-6">
              <h3 className="font-medium mb-2 text-gray-900 dark:text-white">Raw Text:</h3>
              <div className={`p-3 rounded text-sm max-h-32 overflow-y-auto ${
                isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-900'
              }`}>
                {scanResult.rawText}
              </div>
            </div>

            {/* Extracted Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Merchant:</label>
                <input
                  type="text"
                  name="merchant"
                  value={transactionData.merchant}
                  onChange={handleInputChange}
                  placeholder="e.g., Walmart, Starbucks"
                  className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount:</label>
                <input
                  type="number"
                  name="amount"
                  value={transactionData.amount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date:</label>
                <input
                  type="date"
                  name="date"
                  value={transactionData.date}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type:</label>
                <select
                  name="type"
                  value={transactionData.type}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Description:</label>
              <textarea
                name="description"
                value={transactionData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Enter transaction description..."
                className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleCreateTransaction}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium"
              >
                Create Transaction
              </button>
              <button
                onClick={() => {
                  setScanResult(null);
                  setTransactionData({
                    merchant: '',
                    amount: '',
                    date: '',
                    category: 'Uncategorized',
                    description: '',
                    type: 'expense'
                  });
                  setReceiptId(null); // Clear receiptId when scanning another receipt
                  toast.success('Ready to scan another receipt!', {
                    duration: 2000,
                    icon: '🔄',
                  });
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
              >
                Scan Another Receipt
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptScanner;
