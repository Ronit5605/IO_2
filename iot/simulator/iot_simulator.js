/**
 * ==============================================================================
 * Standalone IoT Telemetry Simulator for Smart Ambulance Platform
 * Connects directly to MQTT Broker (e.g. mqtt://localhost:1883)
 * Simulates ESP32 node with MAX30102, DS18B20, NEO-6M GPS, and Panic Button.
 * ==============================================================================
 */

import mqtt from 'mqtt';

const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://127.0.0.1:1883';
const AMBULANCE_ID = process.env.AMBULANCE_ID || 'GJ-05-EM-1081';
const PATIENT_ID = process.env.PATIENT_ID || 'PAT-4011';
const TOPIC = 'ambulance/telemetry';
const INTERVAL_MS = parseInt(process.env.TELEMETRY_INTERVAL_MS || '1500', 10);
const ANOMALY_FREQUENCY = parseInt(process.env.ANOMALY_FREQUENCY || '40', 10);
console.log('========================================================');
console.log('🚑 Smart Ambulance Hardware Node Simulator (ESP32)');
console.log(`🔌 Target Broker: ${MQTT_BROKER}`);
console.log(`📡 Ambulance: ${AMBULANCE_ID}`);
console.log('========================================================');

const client = mqtt.connect(MQTT_BROKER, {
  clientId: `Simulator-${AMBULANCE_ID}-${Math.floor(Math.random() * 1000)}`,
  reconnectPeriod: 3000,
});

// Route coordinates towards Apollo Hospital, Surat
const waypoints = [
  { lat: 21.1610, lng: 72.8120 },
  { lat: 21.1645, lng: 72.8160 },
  { lat: 21.1690, lng: 72.8205 },
  { lat: 21.1730, lng: 72.8235 },
  { lat: 21.1765, lng: 72.8270 },
  { lat: 21.1790, lng: 72.8310 },
  { lat: 21.1815, lng: 72.8350 },
  { lat: 21.1840, lng: 72.8390 },
  { lat: 21.1870, lng: 72.8430 },
  { lat: 21.1895, lng: 72.8258 },
];

let waypointIndex = 0;
let step = 0;

client.on('connect', () => {
  console.log('[MQTT] Connected to broker successfully! Starting telemetry broadcast...');

  setInterval(() => {
    step++;
    const currentWp = waypoints[waypointIndex];
    waypointIndex = (waypointIndex + 1) % waypoints.length;

    // Simulate biomedical readings
    // Trigger anomaly every ANOMALY_FREQUENCY ticks (default 4 ticks = ~6s)
    const isAnomaly = step % ANOMALY_FREQUENCY === 0;
    const isSos = step % (ANOMALY_FREQUENCY * 3) === 0;

    let heartRate = 78 + Math.round((Math.random() - 0.5) * 8);
    let spo2 = 98 + Math.round((Math.random() - 0.5) * 2);
    let temperature = +(36.8 + (Math.random() - 0.5) * 0.4).toFixed(1);

    if (isAnomaly) {
      heartRate = 126; // Tachycardia demonstration alert
      spo2 = 91;       // Hypoxemia demonstration alert
      temperature = 38.9; // Fever demonstration alert
      console.log('⚠️ [SIMULATION ANOMALY] Injecting critical thresholds (HR: 126, SpO2: 91%, Temp: 38.9°C)');
    }

    const payload = {
      ambulanceId: AMBULANCE_ID,
      patientId: PATIENT_ID,
      heartRate,
      spo2,
      temperature,
      latitude: currentWp.lat + (Math.random() - 0.5) * 0.0002,
      longitude: currentWp.lng + (Math.random() - 0.5) * 0.0002,
      speed: 46 + Math.round((Math.random() - 0.5) * 8),
      emergency: isSos,
      timestamp: new Date().toISOString(),
      hardware: false,
    };

    client.publish(TOPIC, JSON.stringify(payload), { qos: 0 }, (err) => {
      if (err) {
        console.error('[MQTT Publish Error]', err);
      } else {
        console.log(`[TX #${step}] HR: ${heartRate} BPM | SpO2: ${spo2}% | Temp: ${temperature}°C | Lat: ${payload.latitude.toFixed(4)}, Lng: ${payload.longitude.toFixed(4)} ${isSos ? '🚨 [SOS PRESSED]' : ''}`);
      }
    });
  }, INTERVAL_MS);
});

client.on('error', (err) => {
  console.error('[MQTT Error]', err.message);
});
