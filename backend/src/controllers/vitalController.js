import VitalReading from '../models/VitalReading.js';
import Emergency from '../models/Emergency.js';
import Ambulance from '../models/Ambulance.js';
import { checkAndGenerateAlerts } from '../services/alertEngine.js';
import { emitVitalUpdate } from '../services/socketService.js';

// @desc    Submit new vital reading from IoT / Ambulance
// @route   POST /api/vitals
export const createVitalReading = async (req, res, next) => {
  try {
    const {
      patientId,
      ambulanceId,
      emergencyId,
      heartRate,
      spo2,
      temperature,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      sensorStatus,
    } = req.body;

    let targetEmergencyId = emergencyId;
    let targetHospitalId = null;

    if (!targetEmergencyId && ambulanceId) {
      const activeEmergency = await Emergency.findOne({
        ambulanceId,
        status: { $in: ['Initiated', 'En Route', 'Hospital Acknowledged'] },
      });
      if (activeEmergency) {
        targetEmergencyId = activeEmergency._id;
        targetHospitalId = activeEmergency.hospitalId;
      }
    } else if (targetEmergencyId) {
      const em = await Emergency.findById(targetEmergencyId);
      if (em) targetHospitalId = em.hospitalId;
    }

    // Evaluate demonstration thresholds & alerts
    const alertEval = await checkAndGenerateAlerts({
      emergencyId: targetEmergencyId,
      ambulanceId,
      patientId,
      hospitalId: targetHospitalId,
      heartRate: Number(heartRate),
      spo2: Number(spo2),
      temperature: Number(temperature),
    });

    const reading = await VitalReading.create({
      patientId,
      emergencyId: targetEmergencyId,
      ambulanceId,
      heartRate,
      spo2,
      temperature,
      bloodPressureSystolic: bloodPressureSystolic || 120,
      bloodPressureDiastolic: bloodPressureDiastolic || 80,
      sensorStatus: sensorStatus || {
        max30102: 'OK',
        ds18b20: 'OK',
        hardwareState: 'SIMULATED',
      },
      isAbnormal: alertEval.isAbnormal,
      abnormalParameters: alertEval.abnormalParameters,
      timestamp: new Date(),
    });

    // Broadcast vital update live via Socket.IO
    emitVitalUpdate({
      emergencyId: targetEmergencyId,
      ambulanceId,
      hospitalId: targetHospitalId,
      patientId,
      vitals: {
        heartRate,
        spo2,
        temperature,
        bloodPressureSystolic: reading.bloodPressureSystolic,
        bloodPressureDiastolic: reading.bloodPressureDiastolic,
        isAbnormal: alertEval.isAbnormal,
        abnormalParameters: alertEval.abnormalParameters,
        timestamp: reading.timestamp,
      },
    });

    res.status(201).json({
      success: true,
      data: reading,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get historical vital readings for a patient
// @route   GET /api/vitals/:patientId
export const getVitalsByPatient = async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;
    const vitals = await VitalReading.find({ patientId: req.params.patientId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit, 10));

    res.json({
      success: true,
      count: vitals.length,
      data: vitals.reverse(), // chronologically ordered for chart display
    });
  } catch (err) {
    next(err);
  }
};
