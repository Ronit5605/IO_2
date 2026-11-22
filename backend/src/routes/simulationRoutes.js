import express from 'express';
import { getStatus, start, stop, setPreset, step } from '../controllers/simulationController.js';

const router = express.Router();

router.get('/status', getStatus);
router.post('/start', start);
router.post('/stop', stop);
router.post('/preset', setPreset);
router.post('/step', step);

export default router;
