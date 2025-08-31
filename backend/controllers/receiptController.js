import OCRProcessor from '../utils/ocrProcessor.js';
import Transaction from '../models/transactionModel.js';
import Category from '../models/categoryModel.js';
import Receipt from '../models/receiptModel.js';
import { getOrCreateDefaultCategory } from '../utils/categoryInitializer.js';
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
    
    console.log('OCR Extracted Data:', extractedData);

    // Prepare extracted data with better validation
    const amount = extractedData.amount || extractedData.total || extractedData.subtotal;
    const numericAmount = amount && !isNaN(parseFloat(amount)) ? parseFloat(amount) : null;

    // Save the receipt data to the Receipt model
    const receipt = await Receipt.create({
      user: req.user.id,
      receiptImage: `data:image/jpeg;base64,${req.file.buffer.toString('base64')}`, // Store as base64 for now
      rawText: extractedData.rawText || '',
      extractedData: {
        merchant: extractedData.merchant?.trim() || null,
        amount: numericAmount,
        total: extractedData.total && !isNaN(parseFloat(extractedData.total)) ? parseFloat(extractedData.total) : null,
        subtotal: extractedData.subtotal && !isNaN(parseFloat(extractedData.subtotal)) ? parseFloat(extractedData.subtotal) : null,
        date: extractedData.date || null,
        description: extractedData.description?.trim() || null,
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
    console.log('Received transaction data:', req.body);
    
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
    if (!merchant || merchant.trim() === '') {
      res.status(400);
      throw new Error('Merchant information is required to create transaction');
    }
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      res.status(400);
      throw new Error('Valid amount (greater than 0) is required to create transaction');
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
      // Use utility function to get or create default category
      const defaultCategory = await getOrCreateDefaultCategory(req.user.id, type || 'expense');
      categoryId = defaultCategory._id;
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

    // Populate transaction details for processed receipts with full category information
    const populatedReceipts = await Receipt.populate(receipts, [
      {
        path: 'transactionId',
        select: 'amount type category description date merchant',
        populate: {
          path: 'category',
          select: 'name color icon'
        }
      }
    ]);

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

// @desc    Update receipt data
// @route   PUT /api/receipts/:id
// @access  Private
const updateReceipt = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { merchant, amount, description, type } = req.body;

    // Find the receipt and ensure it belongs to the user
    const receipt = await Receipt.findOne({
      _id: id,
      user: req.user.id
    });

    if (!receipt) {
      res.status(404);
      throw new Error('Receipt not found');
    }

    // Update the extracted data
    const updateData = {};
    if (merchant !== undefined) updateData['extractedData.merchant'] = merchant;
    if (amount !== undefined) updateData['extractedData.amount'] = parseFloat(amount);
    if (description !== undefined) updateData['extractedData.description'] = description;
    if (type !== undefined) updateData['extractedData.type'] = type;

    // Update the receipt
    const updatedReceipt = await Receipt.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // If this receipt has a transaction, also update the transaction
    if (receipt.transactionId) {
      const transactionUpdate = {};
      if (merchant !== undefined) transactionUpdate.merchant = merchant;
      if (amount !== undefined) transactionUpdate.amount = parseFloat(amount);
      if (description !== undefined) transactionUpdate.description = description;
      if (type !== undefined) transactionUpdate.type = type;

      await Transaction.findByIdAndUpdate(
        receipt.transactionId,
        { $set: transactionUpdate },
        { new: true, runValidators: true }
      );
    }

    res.status(200).json({
      success: true,
      data: updatedReceipt,
      message: 'Receipt updated successfully'
    });
  } catch (error) {
    console.error('Receipt update error:', error);
    res.status(500);
    throw new Error(`Failed to update receipt: ${error.message}`);
  }
});

// @desc    Delete receipt
// @route   DELETE /api/receipts/:id
// @access  Private
const deleteReceipt = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Find the receipt and ensure it belongs to the user
    const receipt = await Receipt.findOne({
      _id: id,
      user: req.user.id
    });

    if (!receipt) {
      res.status(404);
      throw new Error('Receipt not found');
    }

    // If this receipt has a transaction, delete it too
    if (receipt.transactionId) {
      await Transaction.findByIdAndDelete(receipt.transactionId);
    }

    // Delete the receipt
    await Receipt.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Receipt deleted successfully'
    });
  } catch (error) {
    console.error('Receipt deletion error:', error);
    res.status(500);
    throw new Error(`Failed to delete receipt: ${error.message}`);
  }
});

export {
  scanReceipt,
  createTransactionFromReceipt,
  getReceiptHistory,
  updateReceipt,
  deleteReceipt
};