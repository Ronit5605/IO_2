import express from 'express';
import { getOverviewStats, getAnalytics } from '../controllers/statsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/overview', protect, getOverviewStats);
router.get('/analytics', protect, authorize('admin'), getAnalytics);

export default router;
