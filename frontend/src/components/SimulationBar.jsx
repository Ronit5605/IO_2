import React, { useState, useEffect } from 'react';
import { simulationAPI } from '../services/api.js';
import { Play, Pause, RefreshCw, Flame, HeartPulse, Wind, AlertCircle, ChevronDown, ChevronUp, Cpu } from 'lucide-react';

export default function SimulationBar() {
  const [isOpen, setIsOpen] = useState(true);
  const [status, setStatus] = useState({ isRunning: true, currentPreset: 'normal' });
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await simulationAPI.getStatus();
      if (res.success) setStatus(res.data);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSpeedChange = async (ms) => {
    setLoading(true);
    try {
      await simulationAPI.start(ms);
      await fetchStatus();
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePlay = async () => {
    setLoading(true);
    try {
      if (status.isRunning) {
        await simulationAPI.stop();
      } else {
        await simulationAPI.start(status.intervalMs || 2000);
      }
      await fetchStatus();
    } finally {
      setLoading(false);
    }
  };

  const handleSetPreset = async (preset) => {
    setLoading(true);
    try {
      await simulationAPI.setPreset(preset);
      await fetchStatus();
    } finally {
      setLoading(false);
    }
  };

  const handleManualStep = async () => {
    setLoading(true);
    try {
      await simulationAPI.step();
      await fetchStatus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-200 px-4 py-2 text-xs transition-all duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Simulator status pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 font-mono text-[11px]">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400">IoT Engine:</span>
            <span className={`font-bold flex items-center gap-1 ${status.isRunning ? 'text-emerald-400' : 'text-amber-400'}`}>
              <span className={`w-2 h-2 rounded-full ${status.isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {status.isRunning ? 'LIVE SIMULATING' : 'PAUSED'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-slate-400">
            <span>Preset:</span>
            <span className="font-semibold text-slate-200 uppercase bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {status.currentPreset || 'Normal'}
            </span>
          </div>
        </div>

        {/* Center: Quick Anomaly Trigger Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400 hidden md:inline">Demo Scenarios:</span>

          <button
            onClick={() => handleSetPreset('normal')}
            disabled={loading}
            className={`px-2.5 py-1 rounded font-medium transition flex items-center gap-1 ${
              status.currentPreset === 'normal'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Restore Normal Vitals (HR 75 BPM, SpO2 98%, Temp 36.8°C)"
          >
            <HeartPulse className="w-3 h-3 text-emerald-400" />
            Normal
          </button>

          <button
            onClick={() => handleSetPreset('tachycardia')}
            disabled={loading}
            className={`px-2.5 py-1 rounded font-medium transition flex items-center gap-1 ${
              status.currentPreset === 'tachycardia'
                ? 'bg-red-600 text-white font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Simulate Critical Tachycardia (HR > 130 BPM)"
          >
            <HeartPulse className="w-3 h-3 text-red-400" />
            Tachycardia
          </button>

          <button
            onClick={() => handleSetPreset('hypoxia')}
            disabled={loading}
            className={`px-2.5 py-1 rounded font-medium transition flex items-center gap-1 ${
              status.currentPreset === 'hypoxia'
                ? 'bg-sky-600 text-white font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Simulate Hypoxemia (SpO2 < 90%)"
          >
            <Wind className="w-3 h-3 text-sky-400" />
            Hypoxia
          </button>

          <button
            onClick={() => handleSetPreset('hyperthermia')}
            disabled={loading}
            className={`px-2.5 py-1 rounded font-medium transition flex items-center gap-1 ${
              status.currentPreset === 'hyperthermia'
                ? 'bg-amber-600 text-white font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Simulate High Fever / Hyperthermia (> 39.5°C)"
          >
            <Flame className="w-3 h-3 text-amber-400" />
            Fever
          </button>

          <button
            onClick={() => handleSetPreset('emergency_button')}
            disabled={loading}
            className="px-2.5 py-1 rounded font-bold transition flex items-center gap-1 bg-red-700 hover:bg-red-600 text-white shadow-sm shadow-red-700/50"
            title="Simulate Paramedic Hardware SOS Panic Button Press"
          >
            <AlertCircle className="w-3 h-3 text-white animate-bounce" />
            Trigger SOS
          </button>
        </div>

        {/* Right: Simulator Controls */}
        <div className="flex items-center gap-2">
          {/* Cadence Speed Selector */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-[10px]">
            {[1000, 2000, 3000].map((ms) => (
              <button
                key={ms}
                onClick={() => handleSpeedChange(ms)}
                className={`px-1.5 py-0.5 rounded font-mono ${
                  status.intervalMs === ms
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={`Set telemetry interval to ${ms / 1000}s`}
              >
                {ms / 1000}s
              </button>
            ))}
          </div>

          <button
            onClick={handleManualStep}
            disabled={loading}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Simulate Single Telemetry Step"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleTogglePlay}
            disabled={loading}
            className={`flex items-center gap-1 px-2.5 py-1 rounded font-bold transition ${
              status.isRunning
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {status.isRunning ? (
              <>
                <Pause className="w-3 h-3" />
                <span className="hidden sm:inline">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                <span className="hidden sm:inline">Resume</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
