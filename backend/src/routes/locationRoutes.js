import express from 'express';
import { createLocation, getLocationHistory } from '../controllers/locationController.js';

const router = express.Router();

router.post('/', createLocation);
router.get('/:ambulanceId', getLocationHistory);

export default router;
