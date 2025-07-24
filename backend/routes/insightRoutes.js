// backend/routes/insightRoutes.js

import express from 'express';
const router = express.Router();
import { getSpendingInsights } from '../controllers/insightController.js';
import { protect } from '../middleware/authMiddleware.js';

// @route   GET /api/insights
// @desc    Get spending insights for the logged-in user
// @access  Private
router.get('/', protect, getSpendingInsights);

export default router;
