import express from 'express';
import {
  getHospitals,
  getHospitalById,
  createHospital,
  updateHospitalReadiness,
} from '../controllers/hospitalController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getHospitals)
  .post(protect, authorize('admin'), createHospital);

router.route('/:id')
  .get(getHospitalById);

router.route('/:id/readiness')
  .put(protect, authorize('hospital_staff', 'admin'), updateHospitalReadiness);

export default router;
