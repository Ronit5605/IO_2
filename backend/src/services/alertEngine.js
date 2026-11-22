import Alert from '../models/Alert.js';
import Notification from '../models/Notification.js';
import { emitCriticalAlert } from './socketService.js';

// Configurable Demonstration Thresholds (from .env or sensible defaults)
export const getThresholds = () => ({
  HR_MIN: parseFloat(process.env.ALERT_HR_MIN || '60'),
  HR_MAX: parseFloat(process.env.ALERT_HR_MAX || '100'),
  SPO2_MIN: parseFloat(process.env.ALERT_SPO2_MIN || '94'),
  TEMP_MAX: parseFloat(process.env.ALERT_TEMP_MAX || '38.0'),
});

/**
 * Checks incoming vitals, saves alert in DB, and dispatches real-time notification
 */
export const checkAndGenerateAlerts = async ({
  emergencyId,
  ambulanceId,
  patientId,
  hospitalId,
  heartRate,
  spo2,
  temperature,
}) => {
  const THRESHOLDS = getThresholds();
  const abnormalParameters = [];
  const alertsToCreate = [];

  // 1. Heart Rate Check
  if (heartRate > THRESHOLDS.HR_MAX) {
    const isCritical = heartRate >= 120;
    abnormalParameters.push({
      parameter: 'Heart Rate',
      value: heartRate,
      threshold: `> ${THRESHOLDS.HR_MAX} BPM`,
      severity: isCritical ? 'critical' : 'warning',
    });
    alertsToCreate.push({
      emergencyId,
      ambulanceId,
      patientId,
      hospitalId,
      alertType: 'HEART_RATE_CRITICAL',
      severity: isCritical ? 'critical' : 'warning',
      parameter: 'Heart Rate (Tachycardia)',
      value: heartRate,
      threshold: `Max ${THRESHOLDS.HR_MAX} BPM`,
      message: `Abnormal Heart Rate detected: ${heartRate} BPM (Exceeds threshold of ${THRESHOLDS.HR_MAX} BPM)`,
    });
  } else if (heartRate < THRESHOLDS.HR_MIN) {
    const isCritical = heartRate <= 45;
    abnormalParameters.push({
      parameter: 'Heart Rate',
      value: heartRate,
      threshold: `< ${THRESHOLDS.HR_MIN} BPM`,
      severity: isCritical ? 'critical' : 'warning',
    });
    alertsToCreate.push({
      emergencyId,
      ambulanceId,
      patientId,
      hospitalId,
      alertType: 'HEART_RATE_CRITICAL',
      severity: isCritical ? 'critical' : 'warning',
      parameter: 'Heart Rate (Bradycardia)',
      value: heartRate,
      threshold: `Min ${THRESHOLDS.HR_MIN} BPM`,
      message: `Critically Low Heart Rate detected: ${heartRate} BPM (Below threshold of ${THRESHOLDS.HR_MIN} BPM)`,
    });
  }

  // 2. SpO2 Oxygen Saturation Check
  if (spo2 < THRESHOLDS.SPO2_MIN) {
    const isCritical = spo2 < 90;
    abnormalParameters.push({
      parameter: 'SpO2',
      value: spo2,
      threshold: `< ${THRESHOLDS.SPO2_MIN}%`,
      severity: isCritical ? 'critical' : 'warning',
    });
    alertsToCreate.push({
      emergencyId,
      ambulanceId,
      patientId,
      hospitalId,
      alertType: 'SPO2_CRITICAL',
      severity: isCritical ? 'critical' : 'warning',
      parameter: 'Oxygen Saturation (Hypoxemia)',
      value: spo2,
      threshold: `Min ${THRESHOLDS.SPO2_MIN}%`,
      message: `Low Blood Oxygen Saturation: ${spo2}% (Below safe demonstration threshold of ${THRESHOLDS.SPO2_MIN}%)`,
    });
  }

  // 3. Body Temperature Check
  if (temperature > THRESHOLDS.TEMP_MAX) {
    const isCritical = temperature >= 39.5;
    abnormalParameters.push({
      parameter: 'Temperature',
      value: temperature,
      threshold: `> ${THRESHOLDS.TEMP_MAX}°C`,
      severity: isCritical ? 'critical' : 'warning',
    });
    alertsToCreate.push({
      emergencyId,
      ambulanceId,
      patientId,
      hospitalId,
      alertType: 'HIGH_FEVER',
      severity: isCritical ? 'critical' : 'warning',
      parameter: 'Body Temperature (Hyperthermia/Fever)',
      value: temperature,
      threshold: `Max ${THRESHOLDS.TEMP_MAX}°C`,
      message: `Elevated Body Temperature: ${temperature}°C (Above threshold of ${THRESHOLDS.TEMP_MAX}°C)`,
    });
  }

  // Persist alerts and broadcast
  const debounceMs = parseInt(process.env.ALERT_DEBOUNCE_MS || '5000', 10);
  for (const alertData of alertsToCreate) {
    try {
      // Throttle repetitive identical unacknowledged alerts within configured debounce window (default 5s)
      const recentExisting = await Alert.findOne({
        ambulanceId,
        alertType: alertData.alertType,
        isAcknowledged: false,
        createdAt: { $gte: new Date(Date.now() - debounceMs) },
      });

      if (!recentExisting) {
        const savedAlert = await Alert.create(alertData);

        // Also create a hospital notification
        await Notification.create({
          recipientRole: 'hospital_staff',
          recipientHospitalId: hospitalId,
          recipientAmbulanceId: ambulanceId,
          title: `CRITICAL ALERT: ${alertData.parameter}`,
          message: alertData.message,
          type: 'vital_alert',
          data: {
            emergencyId,
            ambulanceId,
            alertId: savedAlert._id,
            parameter: alertData.parameter,
            value: alertData.value,
          },
        });

        // Broadcast immediately over Socket.IO
        emitCriticalAlert(savedAlert);
      }
    } catch (err) {
      console.error('[AlertEngine] Error persisting alert:', err.message);
    }
  }

  return {
    isAbnormal: abnormalParameters.length > 0,
    abnormalParameters,
  };
};

/**
 * Handle Emergency Push Button SOS from ESP32 or Ambulance UI
 */
export const triggerPanicAlert = async ({ emergencyId, ambulanceId, hospitalId, source = 'HARDWARE_BUTTON' }) => {
  const alert = await Alert.create({
    emergencyId,
    ambulanceId,
    hospitalId,
    alertType: source === 'HARDWARE_BUTTON' ? 'EMERGENCY_BUTTON' : 'MANUAL_SOS',
    severity: 'critical',
    parameter: 'Emergency Panic Button',
    value: 1,
    threshold: 'PRESSED',
    message: `EMERGENCY ALERT: Paramedic triggered SOS panic signal via ${source}!`,
  });

  await Notification.create({
    recipientRole: 'hospital_staff',
    recipientHospitalId: hospitalId,
    recipientAmbulanceId: ambulanceId,
    title: 'EMERGENCY SOS BUTTON ACTIVATED',
    message: `Ambulance paramedic activated emergency distress beacon (${source}). Immediate hospital preparation required!`,
    type: 'emergency_created',
    data: { emergencyId, ambulanceId, alertId: alert._id },
  });

  emitCriticalAlert(alert);
  return alert;
};
