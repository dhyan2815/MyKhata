import React from 'react';
import { Helmet } from 'react-helmet-async';
import ReceiptScanner from '../components/receipts/ReceiptScanner';

const ReceiptScannerPage = () => {
  return (
    <>
      <Helmet>
        <title>Receipt Scanner · MyKhata</title>
        <meta name="description" content="Scan receipts individually or process multiple receipts in batch with MyKhata's intelligent receipt scanner" />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <ReceiptScanner />
      </div>
    </>
  );
};

export default ReceiptScannerPage;
