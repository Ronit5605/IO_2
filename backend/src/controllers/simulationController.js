import {
  startSimulation,
  stopSimulation,
  getSimulationStatus,
  setSimulationPreset,
  stepSimulation,
} from '../services/simulationService.js';

// @desc    Get current IoT & GPS simulation state
// @route   GET /api/simulation/status
export const getStatus = (req, res) => {
  res.json({
    success: true,
    data: getSimulationStatus(),
  });
};

// @desc    Start automated real-time simulation
// @route   POST /api/simulation/start
export const start = (req, res) => {
  const { interval = 3000 } = req.body;
  startSimulation(interval);
  res.json({
    success: true,
    message: `IoT Simulation started (${interval}ms loop)`,
    data: getSimulationStatus(),
  });
};

// @desc    Stop automated simulation
// @route   POST /api/simulation/stop
export const stop = (req, res) => {
  stopSimulation();
  res.json({
    success: true,
    message: 'IoT Simulation stopped',
    data: getSimulationStatus(),
  });
};

// @desc    Apply anomaly or test preset (tachycardia, hypoxia, hyperthermia, emergency_button, normal)
// @route   POST /api/simulation/preset
export const setPreset = async (req, res) => {
  const { preset } = req.body;
  const result = await setSimulationPreset(preset);
  res.json({
    success: true,
    message: `Preset switched to ${preset}`,
    data: result,
  });
};

// @desc    Manually step simulation one tick
// @route   POST /api/simulation/step
export const step = async (req, res) => {
  await stepSimulation();
  res.json({
    success: true,
    message: 'Simulated 1 telemetry tick',
  });
};
