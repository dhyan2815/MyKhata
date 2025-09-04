import OCRProcessor from '../utils/ocrProcessor.js';
import cloudStorageService from '../utils/cloudStorage.js';
import cacheService from '../utils/cacheService.js';
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

    // Upload image to cloud storage
    let imageUrl = null;
    let cloudinaryPublicId = null;
    
    try {
      console.log('🚀 Starting Cloudinary upload...');
      const uploadResult = await cloudStorageService.uploadImage(req.file.buffer, {
        folder: `mykhata/receipts/${req.user.id}`,
        tags: ['receipt', 'mykhata', `user_${req.user.id}`],
        optimize: {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 85
        }
      });
      
      console.log('✅ Cloudinary upload successful:', {
        publicId: uploadResult.publicId,
        secureUrl: uploadResult.secureUrl,
        folder: `mykhata/receipts/${req.user.id}`
      });
      
      imageUrl = uploadResult.secureUrl;
      cloudinaryPublicId = uploadResult.publicId;
    } catch (cloudError) {
      console.warn('❌ Cloud storage upload failed, falling back to base64:', cloudError.message);
      console.error('Full error:', cloudError);
      // Fallback to base64 storage if cloud upload fails
      imageUrl = `data:image/jpeg;base64,${req.file.buffer.toString('base64')}`;
    }

    // Parse date if provided
    let parsedDate = null;
    if (extractedData.date) {
      // Try to parse the date in DD/MM/YYYY format
      const dateParts = extractedData.date.split('/');
      if (dateParts.length === 3) {
        // Convert DD/MM/YYYY to MM/DD/YYYY for JavaScript Date parsing
        const day = dateParts[0];
        const month = dateParts[1];
        const year = dateParts[2];
        parsedDate = new Date(`${month}/${day}/${year}`);
        
        // Check if date is valid
        if (isNaN(parsedDate.getTime())) {
          parsedDate = null;
        }
      }
    }

    // Save the receipt data to the Receipt model
    const receipt = await Receipt.create({
      user: req.user.id,
      receiptImage: imageUrl,
      cloudinaryPublicId: cloudinaryPublicId,
      rawText: extractedData.rawText || '',
      extractedData: {
        merchant: extractedData.merchant?.trim() || null,
        amount: numericAmount,
        total: extractedData.total && !isNaN(parseFloat(extractedData.total)) ? parseFloat(extractedData.total) : null,
        subtotal: extractedData.subtotal && !isNaN(parseFloat(extractedData.subtotal)) ? parseFloat(extractedData.subtotal) : null,
        date: parsedDate,
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
        imageUrl: imageUrl,
        isCloudStorage: !!cloudinaryPublicId
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
    const cacheKey = `receipts_${req.user.id}`;
    
    // Check cache first
    let receipts = cacheService.getReceiptData(cacheKey);
    
    if (!receipts) {
      // Get all scanned receipts for the user
      receipts = await Receipt.find({
        user: req.user.id
      }).sort({ createdAt: -1 });

      // Populate transaction details for processed receipts with full category information
      receipts = await Receipt.populate(receipts, [
        {
          path: 'transactionId',
          select: 'amount type category description date merchant',
          populate: {
            path: 'category',
            select: 'name color icon'
          }
        }
      ]);

      // Cache the result
      cacheService.setReceiptData(cacheKey, receipts);
    }

    res.status(200).json({
      success: true,
      count: receipts.length,
      data: receipts
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

    // Invalidate cache
    cacheService.deleteReceiptData(`receipts_${req.user.id}`);

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

    // Delete image from cloud storage if it exists
    if (receipt.cloudinaryPublicId) {
      try {
        await cloudStorageService.deleteImage(receipt.cloudinaryPublicId);
        console.log('Image deleted from cloud storage:', receipt.cloudinaryPublicId);
      } catch (cloudError) {
        console.warn('Failed to delete image from cloud storage:', cloudError.message);
        // Continue with receipt deletion even if cloud deletion fails
      }
    }

    // If this receipt has a transaction, delete it too
    if (receipt.transactionId) {
      await Transaction.findByIdAndDelete(receipt.transactionId);
    }

    // Delete the receipt
    await Receipt.findByIdAndDelete(id);

    // Invalidate cache
    cacheService.deleteReceiptData(`receipts_${req.user.id}`);

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

// @desc    Get cache statistics
// @route   GET /api/receipts/cache-stats
// @access  Private
const getCacheStats = asyncHandler(async (req, res) => {
  try {
    const stats = cacheService.getStats();
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Cache stats error:', error);
    res.status(500);
    throw new Error(`Failed to fetch cache statistics: ${error.message}`);
  }
});

export {
  scanReceipt,
  createTransactionFromReceipt,
  getReceiptHistory,
  updateReceipt,
  deleteReceipt,
  getCacheStats
};