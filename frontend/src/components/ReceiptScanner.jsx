import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useDropzone } from 'react-dropzone';
import { scanReceipt, createTransactionFromReceipt } from '../api/receipts';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ReceiptScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' or 'upload'
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
    
    try {
      const result = await scanReceipt(imageFile);
      setScanResult(result.data);
      
      // Pre-fill transaction data
      setTransactionData(prev => ({
        ...prev,
        merchant: result.data.merchant || '',
        amount: result.data.total || result.data.subtotal || '',
        date: result.data.date || new Date().toISOString().split('T')[0],
        description: `Receipt from ${result.data.merchant || 'Unknown Merchant'}`
      }));
      
    } catch (err) {
      setError(err.message);
      setScanResult(null);
    } finally {
      setIsScanning(false);
    }
  };

  // Create transaction from scanned data
  const handleCreateTransaction = async () => {
    try {
      await createTransactionFromReceipt(transactionData);
      // Reset form and show success message
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
      alert('Transaction created successfully!');
    } catch (err) {
      setError(err.message);
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Receipt Scanner</h1>
        
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
            📷 Camera
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'upload'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📁 Upload File
          </button>
        </div>

        {/* Camera Tab */}
        {activeTab === 'camera' && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Take Photo of Receipt</h2>
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
                  {isScanning ? 'Processing...' : '📸 Capture Photo'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Upload Receipt Image</h2>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <div className="text-4xl mb-4">📁</div>
                {isDragActive ? (
                  <p className="text-blue-600">Drop the receipt image here...</p>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-2">
                      Drag & drop a receipt image here, or click to select
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports: JPG, PNG, GIF (Max: 5MB)
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
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Scanned Receipt Data</h2>
            
            {/* Raw OCR Text */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Raw Text:</h3>
              <div className="bg-gray-100 p-3 rounded text-sm max-h-32 overflow-y-auto">
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
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
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
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date:</label>
                <input
                  type="date"
                  name="date"
                  value={transactionData.date}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type:</label>
                <select
                  name="type"
                  value={transactionData.type}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
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
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleCreateTransaction}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium"
              >
                ✅ Create Transaction
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
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium"
              >
                🔄 Scan Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptScanner;
