import express from 'express';
import { getAlerts, acknowledgeAlert } from '../controllers/alertController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAlerts);
router.put('/:id/acknowledge', protect, acknowledgeAlert);

export default router;
