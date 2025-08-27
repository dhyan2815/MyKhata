import OCRProcessor from '../utils/ocrProcessor.js';
import Transaction from '../models/transactionModel.js';
import Category from '../models/categoryModel.js';
import Receipt from '../models/receiptModel.js';
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

    // Save the receipt data to the Receipt model
    const receipt = await Receipt.create({
      user: req.user.id,
      receiptImage: `data:image/jpeg;base64,${req.file.buffer.toString('base64')}`, // Store as base64 for now
      rawText: extractedData.rawText || '',
      extractedData: {
        merchant: extractedData.merchant || null,
        amount: extractedData.amount || extractedData.total || extractedData.subtotal || null,
        total: extractedData.total || null,
        subtotal: extractedData.subtotal || null,
        date: extractedData.date || null,
        description: extractedData.description || null,
        type: extractedData.type || 'expense',
      },
      status: 'scanned',
    });

    res.status(200).json({
      success: true,
      data: {
        ...extractedData,
        receiptId: receipt._id,
      },
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
      receiptImage,
      receiptId 
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

    // Find a default category for the transaction type
    let categoryId = category;
    if (!categoryId) {
      const defaultCategory = await Category.findOne({
        user: req.user.id,
        type: type || 'expense',
        isDefault: true
      });
      if (defaultCategory) {
        categoryId = defaultCategory._id;
      }
    }

    // Create transaction
    const transaction = await Transaction.create({
      user: req.user.id,
      type: type || 'expense',
      amount: parseFloat(amount),
      category: categoryId,
      description: description || `Receipt from ${merchant}`,
      date: transactionDate,
      merchant: merchant,
      receiptImage: receiptImage || null
    });

    // Update receipt status if receiptId is provided
    if (receiptId) {
      await Receipt.findByIdAndUpdate(receiptId, {
        status: 'processed',
        transactionId: transaction._id,
        processingNotes: 'Successfully converted to transaction'
      });
    }

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
    // Get all scanned receipts for the user
    const receipts = await Receipt.find({
      user: req.user.id
    }).sort({ createdAt: -1 });

    // Populate transaction details for processed receipts
    const populatedReceipts = await Receipt.populate(receipts, {
      path: 'transactionId',
      select: 'amount type category description date merchant'
    });

    res.status(200).json({
      success: true,
      count: receipts.length,
      data: populatedReceipts
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
