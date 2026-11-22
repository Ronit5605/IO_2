import express from 'express';
import { createPatient, getPatients, getPatientById } from '../controllers/patientController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, createPatient)
  .get(protect, getPatients);

router.route('/:id')
  .get(protect, getPatientById);

export default router;
