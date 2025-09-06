import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getReceiptAnalyticsOverview,
  getSpendingPatterns,
  getMerchantInsights,
  getTimeBasedAnalytics,
  getProcessingStats
} from '../controllers/analyticsController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Receipt analytics routes
router.get('/receipts/overview', getReceiptAnalyticsOverview);
router.get('/receipts/spending-patterns', getSpendingPatterns);
router.get('/receipts/merchant-insights', getMerchantInsights);
router.get('/receipts/time-based', getTimeBasedAnalytics);
router.get('/receipts/processing-stats', getProcessingStats);

export default router;
