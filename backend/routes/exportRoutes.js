import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  generatePDFReport,
  exportCSV,
  exportJSON,
  getExportOptions,
  previewExportData
} from '../controllers/exportController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Export routes
router.post('/pdf', generatePDFReport);
router.post('/csv', exportCSV);
router.post('/json', exportJSON);
router.get('/options', getExportOptions);
router.post('/preview', previewExportData);

export default router;
