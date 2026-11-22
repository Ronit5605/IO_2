import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext.jsx';
import {
  Activity,
  AlertTriangle,
  Cpu,
  Flame,
  Heart,
  Radio,
  Save,
  Server,
  Settings as SettingsIcon,
  ShieldAlert,
  Wind,
} from 'lucide-react';

export default function Settings() {
  const { addToast } = useSocket();

  const [thresholds, setThresholds] = useState({
    hrMin: 60,
    hrMax: 100,
    spo2Min: 94,
    tempMax: 38.0,
  });

  const [mqttConfig, setMqttConfig] = useState({
    brokerUrl: 'mqtt://localhost',
    port: 1883,
    qos: 0,
    telemetryTopic: 'ambulance/telemetry',
  });

  const [simulationSettings, setSimulationSettings] = useState({
    intervalMs: 3000,
    gpsJitter: true,
    autoCycleRoute: true,
  });

  const handleSaveThresholds = (e) => {
    e.preventDefault();
    addToast({
      title: 'Thresholds Saved',
      message: 'Demonstration alert criteria updated successfully.',
      type: 'success',
    });
  };

  const handleSaveMQTT = (e) => {
    e.preventDefault();
    addToast({
      title: 'MQTT Config Updated',
      message: 'Broker connection profile updated for ESP32 and gateway.',
      type: 'success',
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 text-slate-100 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-blue-400" />
          <h1 className="text-2xl font-black tracking-tight text-white">System Configuration & Thresholds</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Adjust prehospital alert triggers, hardware telemetry parameters, and simulated node rates
        </p>
      </div>

      {/* Medical Alert Warning Banner */}
      <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-3 shadow-lg">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-amber-300">Academic Demonstration Notice</h4>
          <p className="mt-0.5 text-slate-300 leading-relaxed">
            The thresholds configured below are designed solely for college demonstrations and simulation testing. This platform is not certified by FDA/CE or intended for autonomous clinical diagnosis without licensed physician oversight.
          </p>
        </div>
      </div>

      {/* Configurable Demonstration Thresholds */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <Activity className="w-5 h-5 text-red-500" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Biomedical Anomaly Alert Thresholds
          </h3>
        </div>

        <form onSubmit={handleSaveThresholds} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase">
              <Heart className="w-4 h-4 text-red-500" />
              Minimum Heart Rate (Bradycardia)
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="number"
                value={thresholds.hrMin}
                onChange={(e) => setThresholds({ ...thresholds, hrMin: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
              />
              <span className="text-xs font-bold text-slate-400">BPM</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Generates alert when pulse drops below this level</p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase">
              <Heart className="w-4 h-4 text-red-500" />
              Maximum Heart Rate (Tachycardia)
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="number"
                value={thresholds.hrMax}
                onChange={(e) => setThresholds({ ...thresholds, hrMax: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
              />
              <span className="text-xs font-bold text-slate-400">BPM</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Generates alert when pulse exceeds this level</p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase">
              <Wind className="w-4 h-4 text-sky-400" />
              Minimum Oxygen Saturation (Hypoxia)
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="number"
                value={thresholds.spo2Min}
                onChange={(e) => setThresholds({ ...thresholds, spo2Min: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
              />
              <span className="text-xs font-bold text-slate-400">%</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Generates alert when blood SpO2 drops below safe line</p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase">
              <Flame className="w-4 h-4 text-amber-400" />
              Maximum Body Temperature (Fever)
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                value={thresholds.tempMax}
                onChange={(e) => setThresholds({ ...thresholds, tempMax: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
              />
              <span className="text-xs font-bold text-slate-400">°C</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Generates alert when core temperature exceeds normal range</p>
          </div>

          <div className="sm:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              Update Thresholds
            </button>
          </div>
        </form>
      </div>

      {/* IoT MQTT Broker Settings */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <Radio className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            ESP32 Microcontroller & MQTT Gateway Configuration
          </h3>
        </div>

        <form onSubmit={handleSaveMQTT} className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase">MQTT Broker Host</label>
            <input
              type="text"
              value={mqttConfig.brokerUrl}
              onChange={(e) => setMqttConfig({ ...mqttConfig, brokerUrl: e.target.value })}
              className="mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase">MQTT Port</label>
            <input
              type="number"
              value={mqttConfig.port}
              onChange={(e) => setMqttConfig({ ...mqttConfig, port: Number(e.target.value) })}
              className="mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-300 uppercase">Telemetry Topic</label>
            <input
              type="text"
              value={mqttConfig.telemetryTopic}
              onChange={(e) => setMqttConfig({ ...mqttConfig, telemetryTopic: e.target.value })}
              className="mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              Save MQTT Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
