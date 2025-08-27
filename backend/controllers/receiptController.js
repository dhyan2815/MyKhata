import OCRProcessor from '../utils/ocrProcessor.js';
import Transaction from '../models/transactionModel.js';
import asyncHandler from 'express-async-handler';

const ocrProcessor = new OCRProcessor();

// @desc    Scan receipt and extract data
// @route   POST /api/receipts/scan
// @access  Private
const scanReceipt = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('No image file provided');
    }

    // Process the receipt image
    const extractedData = await ocrProcessor.processReceipt(req.file.buffer);

    res.status(200).json({
      success: true,
      data: extractedData,
      message: 'Receipt scanned successfully'
    });
  } catch (error) {
    console.error('Receipt scanning error:', error);
    res.status(500);
    throw new Error(`Receipt scanning failed: ${error.message}`);
  }
});

// @desc    Create transaction from scanned receipt
// @route   POST /api/receipts/create-transaction
// @access  Private
const createTransactionFromReceipt = asyncHandler(async (req, res) => {
  try {
    const { 
      merchant, 
      amount, 
      date, 
      category, 
      description, 
      type,
      receiptImage 
    } = req.body;

    // Validate required fields
    if (!merchant || !amount) {
      res.status(400);
      throw new Error('Merchant and amount are required');
    }

    // Parse date if provided
    let transactionDate = new Date();
    if (date) {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        transactionDate = parsedDate;
      }
    }

    // Create transaction
    const transaction = await Transaction.create({
      user: req.user.id,
      type: type || 'expense',
      amount: parseFloat(amount),
      category: category || 'Uncategorized',
      description: description || `Receipt from ${merchant}`,
      date: transactionDate,
      merchant: merchant,
      receiptImage: receiptImage || null
    });

    res.status(201).json({
      success: true,
      data: transaction,
      message: 'Transaction created from receipt successfully'
    });
  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500);
    throw new Error(`Failed to create transaction: ${error.message}`);
  }
});

// @desc    Get receipt scanning history
// @route   GET /api/receipts/history
// @access  Private
const getReceiptHistory = asyncHandler(async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user.id,
      receiptImage: { $exists: true, $ne: null }
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    console.error('Receipt history error:', error);
    res.status(500);
    throw new Error(`Failed to fetch receipt history: ${error.message}`);
  }
});

export {
  scanReceipt,
  createTransactionFromReceipt,
  getReceiptHistory
};
