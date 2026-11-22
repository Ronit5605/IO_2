import express from 'express';
import { createVitalReading, getVitalsByPatient } from '../controllers/vitalController.js';

const router = express.Router();

router.post('/', createVitalReading);
router.get('/:patientId', getVitalsByPatient);

export default router;
