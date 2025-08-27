const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const {
  scanReceipt,
  createTransactionFromReceipt,
  getReceiptHistory
} = require('../controllers/receiptController');

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

// Apply authentication middleware to all routes
router.use(protect);

// Route to scan receipt image
router.post('/scan', upload.single('receipt'), scanReceipt);

// Route to create transaction from scanned receipt data
router.post('/create-transaction', createTransactionFromReceipt);

// Route to get receipt scanning history
router.get('/history', getReceiptHistory);

module.exports = router;
