import express from 'express';
import {
  getAmbulances,
  getAmbulanceById,
  createAmbulance,
  updateAmbulance,
  triggerAmbulanceSOS,
} from '../controllers/ambulanceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getAmbulances)
  .post(protect, authorize('admin'), createAmbulance);

router.route('/:id')
  .get(getAmbulanceById)
  .put(protect, updateAmbulance);

router.post('/:id/sos', triggerAmbulanceSOS);

export default router;
