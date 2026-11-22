import Ambulance from '../models/Ambulance.js';
import Emergency from '../models/Emergency.js';
import Hospital from '../models/Hospital.js';
import Patient from '../models/Patient.js';
import { handleTelemetryMessage } from './mqttService.js';

let isRunning = false;
let simulationInterval = null;
let currentIntervalMs = 2000;
let currentPreset = 'normal'; // normal, tachycardia, hypoxia, hyperthermia, critical_multi

// Sample GPS Waypoints around Surat / typical city layout leading to Apollo / Civil Hospital
const sampleRouteCoordinates = [
  { lat: 21.1610, lng: 72.8120 },
  { lat: 21.1645, lng: 72.8160 },
  { lat: 21.1690, lng: 72.8205 },
  { lat: 21.1730, lng: 72.8235 },
  { lat: 21.1765, lng: 72.8270 },
  { lat: 21.1790, lng: 72.8310 },
  { lat: 21.1815, lng: 72.8350 },
  { lat: 21.1840, lng: 72.8390 },
  { lat: 21.1870, lng: 72.8430 },
  { lat: 21.1900, lng: 72.8470 },
];

let routeIndex = 0;
let routeDirection = 1;

export const setSimulationPreset = async (preset) => {
  currentPreset = preset;
  console.log(`[Simulator] Preset changed to: ${preset}`);
  // Immediately execute a simulation step so the alert triggers instantly with zero delay
  try {
    await stepSimulation();
  } catch (e) {
    console.error('[Simulator] Immediate step error:', e.message);
  }
  return { preset: currentPreset };
};

export const getSimulationStatus = () => ({
  isRunning,
  currentPreset,
  intervalMs: currentIntervalMs,
  routeStep: routeIndex,
  totalSteps: sampleRouteCoordinates.length,
});

const generateRealisticVitals = () => {
  let hr = 75 + Math.round((Math.random() - 0.5) * 6); // 72-78 normal
  let spo2 = 98 + Math.round((Math.random() - 0.5) * 2); // 97-99 normal
  let temp = +(36.7 + (Math.random() - 0.5) * 0.4).toFixed(1); // 36.5 - 36.9

  if (currentPreset === 'tachycardia') {
    hr = 132 + Math.round((Math.random() - 0.5) * 8); // 128 - 136 BPM
  } else if (currentPreset === 'bradycardia') {
    hr = 46 + Math.round((Math.random() - 0.5) * 4); // 44 - 48 BPM
  } else if (currentPreset === 'hypoxia') {
    spo2 = 88 + Math.round((Math.random() - 0.5) * 3); // 86 - 90%
  } else if (currentPreset === 'hyperthermia') {
    temp = +(39.6 + (Math.random() - 0.5) * 0.4).toFixed(1); // 39.4 - 39.8°C
  } else if (currentPreset === 'critical_multi') {
    hr = 142;
    spo2 = 86;
    temp = 39.9;
  }

  return { hr, spo2, temp };
};

export const stepSimulation = async () => {
  try {
    // Find active ambulance or fallback to first available
    const ambulance = await Ambulance.findOne({
      $or: [{ status: 'Emergency' }, { status: 'On Duty' }, { status: 'Available' }],
    });

    if (!ambulance) return;

    // Advance GPS coordinate
    const waypoint = sampleRouteCoordinates[routeIndex];
    routeIndex += routeDirection;
    if (routeIndex >= sampleRouteCoordinates.length - 1) {
      routeDirection = -1;
    } else if (routeIndex <= 0) {
      routeDirection = 1;
    }

    const { hr, spo2, temp } = generateRealisticVitals();

    const payload = {
      ambulanceId: ambulance.vehicleNumber,
      heartRate: hr,
      spo2: spo2,
      temperature: temp,
      latitude: waypoint.lat + (Math.random() - 0.5) * 0.0003,
      longitude: waypoint.lng + (Math.random() - 0.5) * 0.0003,
      speed: 48 + Math.round((Math.random() - 0.5) * 10),
      heading: 45,
      timestamp: new Date().toISOString(),
      emergency: currentPreset === 'emergency_button',
      hardware: false,
    };

    if (currentPreset === 'emergency_button') {
      currentPreset = 'normal'; // Reset button press after single trigger
    }

    await handleTelemetryMessage('ambulance/telemetry', JSON.stringify(payload));
  } catch (err) {
    console.error('[Simulator] Error in simulation step:', err.message);
  }
};

export const startSimulation = (intervalMs = 2000) => {
  if (simulationInterval) clearInterval(simulationInterval);
  currentIntervalMs = intervalMs;
  isRunning = true;
  console.log(`[Simulator] Real-time IoT & GPS Simulation running (interval: ${intervalMs}ms)`);
  simulationInterval = setInterval(stepSimulation, intervalMs);
};

export const stopSimulation = () => {
  if (!isRunning) return;
  isRunning = false;
  if (simulationInterval) clearInterval(simulationInterval);
  console.log('[Simulator] Simulation stopped.');
};
