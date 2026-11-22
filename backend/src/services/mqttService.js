import net from 'net';
import Aedes from 'aedes';
import Ambulance from '../models/Ambulance.js';
import Emergency from '../models/Emergency.js';
import Patient from '../models/Patient.js';
import VitalReading from '../models/VitalReading.js';
import LocationHistory from '../models/LocationHistory.js';
import { checkAndGenerateAlerts, triggerPanicAlert } from './alertEngine.js';
import { emitVitalUpdate, emitLocationUpdate } from './socketService.js';
import { calculateDistanceKm, calculateETA } from './geoService.js';

let aedesInstance = null;
let mqttServer = null;

export const initMQTTBroker = (port = 1883) => {
  aedesInstance = new Aedes();
  mqttServer = net.createServer(aedesInstance.handle);

  mqttServer.listen(port, () => {
    console.log(`[MQTT] Embedded Aedes MQTT Broker listening on port ${port}`);
  });

  aedesInstance.on('client', (client) => {
    console.log(`[MQTT] Client connected: ${client ? client.id : 'unknown'}`);
  });

  aedesInstance.on('clientDisconnect', (client) => {
    console.log(`[MQTT] Client disconnected: ${client ? client.id : 'unknown'}`);
  });

  aedesInstance.on('publish', async (packet, client) => {
    // Ignore internal Aedes broker topics
    if (!packet.topic || packet.topic.startsWith('$SYS')) return;

    try {
      const topic = packet.topic;
      const message = packet.payload.toString();

      if (topic === 'ambulance/telemetry' || topic.startsWith('ambulance/')) {
        await handleTelemetryMessage(topic, message);
      }
    } catch (err) {
      console.error('[MQTT] Error processing packet:', err.message);
    }
  });

  mqttServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[MQTT] Port ${port} is in use. Embedded broker disabled (external broker likely active).`);
    } else {
      console.error('[MQTT] Server error:', err.message);
    }
  });

  return aedesInstance;
};

/**
 * Handle incoming IoT telemetry from ESP32 or Simulator
 */
export const handleTelemetryMessage = async (topic, rawPayload) => {
  let data;
  try {
    data = JSON.parse(rawPayload);
  } catch (e) {
    console.warn('[MQTT] Non-JSON payload received:', rawPayload);
    return;
  }

  const {
    ambulanceId: vehicleCode,
    patientId: patientCode,
    heartRate,
    spo2,
    temperature,
    latitude,
    longitude,
    speed = 45,
    heading = 0,
    emergency = false,
  } = data;

  if (!vehicleCode) return;

  // 1. Resolve Ambulance by vehicleNumber or callSign or ID
  let ambulance = await Ambulance.findOne({
    $or: [{ vehicleNumber: vehicleCode }, { callSign: vehicleCode }],
  });

  if (!ambulance && vehicleCode.length === 24) {
    ambulance = await Ambulance.findById(vehicleCode);
  }

  if (!ambulance) {
    // If not found, skip or create if in demo mode
    return;
  }

  // Update Ambulance status, IoT heartbeat, and GPS
  ambulance.currentLocation = {
    latitude: latitude || ambulance.currentLocation.latitude,
    longitude: longitude || ambulance.currentLocation.longitude,
    speed: speed || 0,
    heading: heading || 0,
    updatedAt: new Date(),
  };
  ambulance.iotDevice.lastHeartbeat = new Date();
  ambulance.iotDevice.status = 'Online';
  await ambulance.save();

  // 2. Find Active Emergency
  let emergencyDoc = null;
  if (ambulance.activeEmergencyId) {
    emergencyDoc = await Emergency.findById(ambulance.activeEmergencyId).populate('hospitalId');
  } else {
    emergencyDoc = await Emergency.findOne({
      ambulanceId: ambulance._id,
      status: { $in: ['Initiated', 'En Route', 'Hospital Acknowledged'] },
    }).populate('hospitalId');
  }

  let hospitalId = emergencyDoc?.hospitalId?._id || emergencyDoc?.hospitalId;
  let patientId = emergencyDoc?.patientId;

  // If patientCode supplied and patientId not resolved
  if (!patientId && patientCode) {
    const patientDoc = await Patient.findOne({ patientId: patientCode });
    if (patientDoc) patientId = patientDoc._id;
  }

  let distanceKm = 0;
  let etaMinutes = 0;

  // 3. Update Emergency GPS & ETA
  if (emergencyDoc && latitude && longitude) {
    const destLat = emergencyDoc.destinationHospital.latitude;
    const destLng = emergencyDoc.destinationHospital.longitude;
    distanceKm = calculateDistanceKm(latitude, longitude, destLat, destLng);
    etaMinutes = calculateETA(distanceKm, speed);

    emergencyDoc.currentLocation = {
      latitude,
      longitude,
      speed,
      heading,
      updatedAt: new Date(),
    };
    emergencyDoc.distanceRemainingKm = distanceKm;
    emergencyDoc.etaMinutes = etaMinutes;
    await emergencyDoc.save();

    // Record location history
    await LocationHistory.create({
      ambulanceId: ambulance._id,
      emergencyId: emergencyDoc._id,
      latitude,
      longitude,
      speed,
      heading,
    });
  }

  // Broadcast Location
  if (latitude && longitude) {
    emitLocationUpdate({
      ambulanceId: ambulance._id,
      emergencyId: emergencyDoc?._id,
      hospitalId,
      vehicleNumber: ambulance.vehicleNumber,
      callSign: ambulance.callSign,
      location: {
        latitude,
        longitude,
        speed,
        heading,
        distanceKm,
        etaMinutes,
        updatedAt: new Date(),
      },
    });
  }

  // 4. Handle Emergency Panic SOS Button
  if (emergency) {
    await triggerPanicAlert({
      emergencyId: emergencyDoc?._id,
      ambulanceId: ambulance._id,
      hospitalId,
      source: 'HARDWARE_BUTTON',
    });
  }

  // 5. Process Vitals
  if (heartRate != null && spo2 != null && temperature != null) {
    // Check demonstration thresholds
    const alertEval = await checkAndGenerateAlerts({
      emergencyId: emergencyDoc?._id,
      ambulanceId: ambulance._id,
      patientId,
      hospitalId,
      heartRate: Number(heartRate),
      spo2: Number(spo2),
      temperature: Number(temperature),
    });

    // Record Vital in MongoDB if patient linked
    if (patientId) {
      await VitalReading.create({
        patientId,
        emergencyId: emergencyDoc?._id,
        ambulanceId: ambulance._id,
        heartRate: Number(heartRate),
        spo2: Number(spo2),
        temperature: Number(temperature),
        isAbnormal: alertEval.isAbnormal,
        abnormalParameters: alertEval.abnormalParameters,
        sensorStatus: {
          max30102: 'OK',
          ds18b20: 'OK',
          hardwareState: data.hardware ? 'REAL_HARDWARE' : 'SIMULATED',
        },
      });
    }

    // Broadcast Vitals via Socket.IO
    emitVitalUpdate({
      emergencyId: emergencyDoc?._id,
      ambulanceId: ambulance._id,
      hospitalId,
      patientId,
      vehicleNumber: ambulance.vehicleNumber,
      vitals: {
        heartRate: Number(heartRate),
        spo2: Number(spo2),
        temperature: Number(temperature),
        isAbnormal: alertEval.isAbnormal,
        abnormalParameters: alertEval.abnormalParameters,
        timestamp: new Date().toISOString(),
      },
    });
  }
};
