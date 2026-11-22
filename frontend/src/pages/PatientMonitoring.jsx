import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext.jsx';
import { vitalsAPI, emergenciesAPI } from '../services/api.js';
import VitalCard from '../components/VitalCard.jsx';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Activity, Heart, ShieldAlert, Sparkles, Thermometer, User, Wind } from 'lucide-react';

export default function PatientMonitoring() {
  const { latestVital, vitalHistory } = useSocket();
  const [emergencies, setEmergencies] = useState([]);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [historyTable, setHistoryTable] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    try {
      const res = await emergenciesAPI.getAll();
      if (res.success && res.data.length > 0) {
        setEmergencies(res.data);
        const current = res.data[0];
        setSelectedEmergency(current);

        if (current.patientId?._id) {
          const vitalsRes = await vitalsAPI.getByPatient(current.patientId._id, 30);
          if (vitalsRes.success) setHistoryTable(vitalsRes.data);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const currentHR = latestVital?.heartRate ?? 82;
  const currentSpO2 = latestVital?.spo2 ?? 98;
  const currentTemp = latestVital?.temperature ?? 36.8;

  const patient = selectedEmergency?.patientId;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 text-slate-100">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-7 h-7 text-red-400 animate-pulse" />
            <h1 className="text-2xl font-black tracking-tight text-white">
              Patient Biomedical Telemetry Monitoring
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time biometric telemetry streaming from MAX30102 & DS18B20 IoT sensors
          </p>
        </div>

        {/* Patient Selection Dropdown */}
        <div className="flex items-center gap-3">
          <select
            value={selectedEmergency?._id || ''}
            onChange={(e) => {
              const emg = emergencies.find((em) => em._id === e.target.value);
              setSelectedEmergency(emg || null);
            }}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {emergencies.map((emg) => (
              <option key={emg._id} value={emg._id}>
                {emg.patientId?.name || 'Patient'} ({emg.caseNumber})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Patient Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-lg">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-white">{patient?.name || 'Harish Bhai Parekh'}</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                {patient?.patientId || 'PAT-4011'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/30">
                {selectedEmergency?.severity || 'Critical'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {patient?.age || 62} Years • {patient?.gender || 'Male'} • Blood Group: <span className="font-bold text-red-400">{patient?.bloodGroup || 'B+'}</span> • Complaint: <span className="text-slate-300">{patient?.chiefComplaint || 'Cardiac distress'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300">
            <span className="text-slate-500 mr-1">Allergies:</span>
            <span className="text-amber-400 font-medium">{patient?.allergies?.join(', ') || 'None'}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300">
            <span className="text-slate-500 mr-1">Ambulance:</span>
            <span className="font-bold text-white">{selectedEmergency?.ambulanceId?.callSign || 'AMB-ALPHA-01'}</span>
          </div>
        </div>
      </div>

      {/* Vital Sign Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <VitalCard
          title="Pulse / Heart Rate"
          value={currentHR}
          unit="BPM"
          type="heart"
          isAbnormal={currentHR > 100 || currentHR < 60}
          thresholdNote="Demo limits: 60 - 100 BPM"
          subText="Sensor: MAX30102"
        />

        <VitalCard
          title="Oxygen Saturation"
          value={currentSpO2}
          unit="SpO2 %"
          type="spo2"
          isAbnormal={currentSpO2 < 94}
          thresholdNote="Demo limits: ≥ 94%"
          subText="Sensor: MAX30102"
        />

        <VitalCard
          title="Body Temperature"
          value={currentTemp}
          unit="°C"
          type="temp"
          isAbnormal={currentTemp > 38.0}
          thresholdNote="Demo limits: ≤ 38.0°C"
          subText="Sensor: DS18B20 OneWire"
        />
      </div>

      {/* Real-time Telemetry Trend Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-500" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Continuous Prehospital Waveform & Telemetry
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400">● 1000ms WebSocket Feed</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={vitalHistory.length > 0 ? vitalHistory : [
              { time: '16:10', heartRate: 82, spo2: 98, temperature: 36.8 },
              { time: '16:11', heartRate: 85, spo2: 98, temperature: 36.8 },
              { time: '16:12', heartRate: 89, spo2: 97, temperature: 36.9 },
              { time: '16:13', heartRate: 86, spo2: 98, temperature: 36.9 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                labelStyle={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Line
                type="monotone"
                dataKey="heartRate"
                name="Heart Rate (BPM)"
                stroke="#ef4444"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="spo2"
                name="SpO2 (%)"
                stroke="#0284c7"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="temperature"
                name="Temp (°C)"
                stroke="#f59e0b"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Historical Telemetry Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Recorded Prehospital Vitals History
          </h3>
          <span className="text-xs text-slate-400">Total Samples: {historyTable.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Heart Rate</th>
                <th className="py-3 px-4">SpO2</th>
                <th className="py-3 px-4">Temperature</th>
                <th className="py-3 px-4">Blood Pressure</th>
                <th className="py-3 px-4">Status Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {historyTable.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {new Date(row.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-4 font-bold text-red-400">{row.heartRate} BPM</td>
                  <td className="py-3 px-4 font-bold text-sky-400">{row.spo2}%</td>
                  <td className="py-3 px-4 font-bold text-amber-400">{row.temperature}°C</td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {row.bloodPressureSystolic || 120}/{row.bloodPressureDiastolic || 80} mmHg
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      row.isAbnormal ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {row.isAbnormal ? 'ABNORMAL' : 'NORMAL'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
