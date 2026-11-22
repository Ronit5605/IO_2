import express from 'express';
import {
  createEmergency,
  getEmergencies,
  getEmergencyById,
  updateEmergencyStatus,
  acknowledgeEmergency,
} from '../controllers/emergencyController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, createEmergency)
  .get(protect, getEmergencies);

router.route('/:id')
  .get(protect, getEmergencyById);

router.route('/:id/status')
  .put(protect, updateEmergencyStatus);

router.route('/:id/acknowledge')
  .put(protect, authorize('hospital_staff', 'admin'), acknowledgeEmergency);

export default router;
