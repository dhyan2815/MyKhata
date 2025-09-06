import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import ReceiptScanner from '../components/receipts/ReceiptScanner';
import BatchProcessor from '../components/receipts/BatchProcessor';

const ReceiptScannerPage = () => {
  const [activeMode, setActiveMode] = useState('single'); // 'single' or 'batch'

  return (
    <>
      <Helmet>
        <title>Receipt Scanner · MyKhata</title>
        <meta name="description" content="Scan receipts individually or process multiple receipts in batch with MyKhata's intelligent receipt scanner" />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Mode Toggle */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 w-fit">
              <button
                onClick={() => setActiveMode('single')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeMode === 'single'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Single Receipt
              </button>
              <button
                onClick={() => setActiveMode('batch')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeMode === 'batch'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Batch Processing
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          {activeMode === 'single' ? (
            <ReceiptScanner />
          ) : (
            <BatchProcessor 
              onComplete={() => {
                // Handle completion - could refresh data or show success message
                console.log('Batch processing completed');
              }}
              onCancel={() => setActiveMode('single')}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default ReceiptScannerPage;
