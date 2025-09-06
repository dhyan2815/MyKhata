import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/authMiddleware.js';
import {
  scanReceipt,
  createTransactionFromReceipt,
  getReceiptHistory,
  updateReceipt,
  deleteReceipt,
  getCacheStats,
  batchScanReceipts,
  batchCreateTransactions,
  getSmartCategorySuggestions,
  learnFromCategorization,
  autoCategorizeReceipt
} from '../controllers/receiptController.js';

const router = express.Router();

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Configure multer for batch uploads (multiple files)
const batchUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10, // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Apply authentication middleware to all routes
router.use(protect);

// Route to scan receipt image
router.post('/scan', upload.single('receipt'), scanReceipt);

// Route to batch scan multiple receipts
router.post('/batch-scan', batchUpload.array('receipts', 10), batchScanReceipts);

// Route to create transaction from scanned receipt data
router.post('/create-transaction', createTransactionFromReceipt);

// Route to batch create transactions from receipts
router.post('/batch-create-transactions', batchCreateTransactions);

// Route to get smart category suggestions
router.post('/smart-categorize', getSmartCategorySuggestions);

// Route to learn from user's categorization decision
router.post('/learn-categorization', learnFromCategorization);

// Route to auto-categorize receipt
router.post('/auto-categorize', autoCategorizeReceipt);

// Route to get receipt scanning history
router.get('/history', getReceiptHistory);

// Route to update receipt data
router.put('/:id', updateReceipt);

// Route to delete receipt
router.delete('/:id', deleteReceipt);

// Route to get cache statistics
router.get('/cache-stats', getCacheStats);

export default router;